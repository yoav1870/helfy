import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import userService from '../../services/user.service';

const EMPTY_PASSWORD_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' };

function ProfileSection() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', email: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userService.getProfile();
        setProfile(response.data);
        setProfileForm({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const response = await userService.updateProfile(profileForm);
      setProfile(response.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsSavingPassword(true);
    try {
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm(EMPTY_PASSWORD_FORM);
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <p className="text-sm text-gray-500 mb-4">
          Member since
          {' '}
          {new Date(profile.createdAt).toLocaleDateString()}
        </p>
        <form onSubmit={handleProfileSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Input label="First Name" name="firstName" value={profileForm.firstName} onChange={handleProfileChange} required />
            <Input label="Last Name" name="lastName" value={profileForm.lastName} onChange={handleProfileChange} required />
          </div>
          <Input label="Email" type="email" name="email" value={profileForm.email} onChange={handleProfileChange} required />
          <Button type="submit" isLoading={isSavingProfile}>Save Changes</Button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSubmit}>
          <Input
            label="Current Password"
            type="password"
            name="currentPassword"
            value={passwordForm.currentPassword}
            onChange={handlePasswordChange}
            required
          />
          <Input
            label="New Password"
            type="password"
            name="newPassword"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            required
          />
          <Button type="submit" isLoading={isSavingPassword}>Update Password</Button>
        </form>
      </div>
    </div>
  );
}

export default ProfileSection;
