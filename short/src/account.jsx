import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSpinner,
    faXmark,
    faUserCircle,
    faFile,
    faCircleCheck,
    faCloudArrowUp
} from "@fortawesome/pro-regular-svg-icons";
import {useEffect, useState} from "react";

export default function Account() {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/user");
            const data = await response.json();

            if (response.ok) {
                setUserData(data);
                setFormData({
                    username: data.username || '',
                    firstname: data.firstname || '',
                    lastname: data.lastname || ''
                });
            } else {
                setError(data.message || "Failed to fetch user data");
            }
        } catch (err) {
            setError("An error occurred while fetching user data");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            setError(null);

            const response = await fetch("/change", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstname: formData.firstname,
                    lastname: formData.lastname,
                    username: formData.username
                })
            });

            const data = await response.json();

            if (response.ok) {
                setUserData(data.user);
                setIsEditing(false);
                console.log("Profile updated successfully");
            } else {
                setError(data.message || "Failed to update profile");
            }
        } catch (err) {
            setError("An error occurred while updating user data");
            console.error(err);
        }
    };

    const handleCancel = () => {
        setFormData({
            username: userData.username || '',
            firstname: userData.firstname || '',
            lastname: userData.lastname || ''
        });
        setIsEditing(false);
        setError(null);
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-center py-12">
                    <FontAwesomeIcon icon={faSpinner} className="text-blue-500 animate-spin mr-3" size="lg" />
                    <span className="text-gray-600">Loading account information...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faXmark} className="text-red-500 mr-2" />
                        <span className="text-red-700">Error: {error}</span>
                    </div>
                    <button
                        onClick={fetchUserData}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Account Settings</h1>
                <p className="text-gray-600">Manage your profile information and preferences</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <FontAwesomeIcon icon={faUserCircle} className="text-blue-600" size="2x" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">
                                {userData?.firstname && userData?.lastname
                                    ? `${userData.firstname} ${userData.lastname}`
                                    : userData?.username || 'User'
                                }
                            </h2>
                        </div>
                    </div>

                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                {/* Profile Information */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800">
                                    {userData?.username || 'Not set'}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="firstname"
                                    value={formData.firstname}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800">
                                    {userData?.firstname || 'Not set'}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="lastname"
                                    value={formData.lastname}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800">
                                    {userData?.lastname || 'Not set'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action buttons when editing */}
                    {isEditing && (
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Account Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <FontAwesomeIcon icon={faFile} className="text-blue-600 mb-2" size="lg" />
                        <p className="text-2xl font-bold text-blue-600">
                            {userData?.files?.length || 0}
                        </p>
                        <p className="text-sm text-gray-600">Total Files</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <FontAwesomeIcon icon={faCircleCheck} className="text-green-600 mb-2" size="lg" />
                        <p className="text-2xl font-bold text-green-600">
                            {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">Member Since</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <FontAwesomeIcon icon={faCloudArrowUp} className="text-purple-600 mb-2" size="lg" />
                        <p className="text-2xl font-bold text-purple-600">
                            {userData?.updatedAt ? new Date(userData.updatedAt).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">Last Updated</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
