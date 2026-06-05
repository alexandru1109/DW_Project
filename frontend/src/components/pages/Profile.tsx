import React, { useEffect, useState } from "react";
import axios from "../../config/axiosConfig";
import Navbar from "../Home/Navbar";
import "./Profile.css";

interface UserProfile {
  name: string;
  email: string;
  passHash: string;
  role: string;
  strategy: string;
  profilePicture?: string; // Optional profile picture field
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    passHash: "",
    role: "",
    strategy: "",
    profilePicture: "",
  });

  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null); // For uploading a new picture
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          const response = await axios.get("/users/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setProfile(response.data);
        }
      } catch (error) {
        console.error("Error fetching profile data", error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        await axios.put(
          "/users/update",
          { ...profile, password },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsEditing(false);
        alert("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!profilePicture) {
      alert("Please select a picture to upload.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        const formData = new FormData();
        formData.append("profilePicture", profilePicture);

        const response = await axios.post("/users/profile/upload-picture", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        setProfile((prevProfile) => ({
          ...prevProfile,
          profilePicture: response.data.profilePicture,
        }));
        alert("Profile picture updated successfully!");
      }
    } catch (error) {
      console.error("Error uploading profile picture", error);
    }
  };

  return (
    <>
    <Navbar />
    <div className="profile-container">
      <div className="profile-card-custom">
        <div className="profile-header">
          <div className="profile-picture-container">
            <img
              src={profile.profilePicture
                ? `http://localhost:5869${profile.profilePicture}`
                : "/default-profile.png"}
              alt="Profile"
              className="profile-picture" />
          </div>
          <h2>{profile.name}</h2>
        </div>
        <form>
          <div className="profile-field-custom">
            <label>Name:</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange} />
            ) : (
              <p>{profile.name}</p>
            )}
          </div>
          <div className="profile-field-custom">
            <label>Email:</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange} />
            ) : (
              <p>{profile.email}</p>
            )}
          </div>
          <div className="profile-field-custom">
            <label>Role:</label>
            {isEditing ? (
              <input
                type="text"
                name="role"
                value={profile.role}
                onChange={handleChange} />
            ) : (
              <p>{profile.role}</p>
            )}
          </div>
          <div className="profile-field-custom">
            <label>Strategy:</label>
            {isEditing ? (
              <input
                type="text"
                name="strategy"
                value={profile.strategy}
                onChange={handleChange} />
            ) : (
              <p>{profile.strategy}</p>
            )}
          </div>
          <div className="profile-field-custom">
            <label>Password:</label>
            {isEditing ? (
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} />
            ) : (
              <p>********</p>
            )}
          </div>
        </form>
        {isEditing && (
          <div className="profile-field-custom">
            <label>Profile Picture:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange} />
            <button type="button" onClick={handleUploadProfilePicture}>
              Upload Picture
            </button>
          </div>
        )}
        <div className="chart-buttons">
          <button onClick={isEditing ? handleSave : () => setIsEditing(true)}>
            {isEditing ? "Save" : "Edit Profile"}
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default Profile;
