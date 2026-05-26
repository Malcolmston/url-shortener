import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/session';
import { Link, Click } from '@/lib/models';
import { buildClicksByDay, topN } from '@/lib/analytics';
import { notFound, serverError } from '@/lib/response';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionUser = await requireUser();
    const { Op } = await import('sequelize');

    // Ownership check — 404 (not 403) to avoid leaking link existence
    const link = await Link.findOne({
      where: { id: parseInt(id, 10), userId: sessionUser.id },
    });
    if (!link) return notFound('Link');

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const clicks = await Click.findAll({
      where: {
        linkId: link.id,
        createdAt: { [Op.gte]: thirtyDaysAgo },
      },
      attributes: ['ipHash', 'device', 'os', 'browser', 'referrer', 'createdAt'],
      order: [['createdAt', 'ASC']],
      raw: true,
    });

    const uniqueVisitors = new Set(
      (clicks as any[]).map((c) => c.ipHash).filter(Boolean)
    ).size;

    return NextResponse.json({
      ok: true,
      totalClicks: clicks.length,
      uniqueVisitors,
      clicksByDay: buildClicksByDay(clicks as any),
      topDevices:   topN(clicks as any, 'device'),
      topOS:        topN(clicks as any, 'os'),
      topBrowsers:  topN(clicks as any, 'browser'),
      topReferrers: topN(clicks as any, 'referrer'),
    });
  } catch (e) {
    return serverError(e);
  }
}
