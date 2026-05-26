import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/session';
import { Link, Click } from '@/lib/models';
import { buildClicksByDay } from '@/lib/analytics';
import { serverError } from '@/lib/response';

export async function GET() {
  try {
    const sessionUser = await requireUser();
    const { Op } = await import('sequelize');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get all link IDs belonging to this user
    const userLinks = await Link.findAll({
      where: { userId: sessionUser.id },
      attributes: ['id'],
      raw: true,
    });
    const linkIds = userLinks.map((l: any) => l.id);

    // If no links, return zeros
    if (linkIds.length === 0) {
      return NextResponse.json({ ok: true, totalClicks: 0, clicksByDay: {} });
    }

    const where = {
      linkId: { [Op.in]: linkIds },
      createdAt: { [Op.gte]: thirtyDaysAgo },
    };

    const totalClicks = await Click.count({ where });
    const clicks = await Click.findAll({
      where,
      attributes: ['createdAt'],
      order: [['createdAt', 'ASC']],
      raw: true,
    });

    return NextResponse.json({
      ok: true,
      totalClicks,
      clicksByDay: buildClicksByDay(clicks as any),
    });
  } catch (e) {
    return serverError(e);
  }
}
