import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, GraduationCap, MapPin, BookOpen, Brain, Loader2, Edit, Save, X, ArrowLeft } from 'lucide-react';
import { updateProfile } from '../services/authService';
import { toast } from 'sonner';
import { useAppContext } from '../context/AppContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading, refreshUser } = useAppContext(); // Get user from context
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentEmail: '',
    instituteName: '',
    country: '',
    location: '',
    qualification: '',
    course: '',
    expertise: [],
    bio: '',
    profilePicture: ''
  });
  const [expertiseInput, setExpertiseInput] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  // Initialize form data from context user data
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        studentEmail: user.studentEmail || '',
        instituteName: user.instituteName || '',
        country: user.country || '',
        location: user.location || '',
        qualification: user.qualification || '',
        course: user.course || '',
        expertise: user.expertise || [],
        bio: user.bio || '',
        profilePicture: user.profilePicture || ''
      });
    } else if (!loading.user) {
      // Redirect to login if user not found and not loading
      navigate('/login');
    }
  }, [user, loading.user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the selected image
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      
      // For now, we'll just store the URL in the form data
      // In a real app, you would upload this to a server
      setFormData(prev => ({
        ...prev,
        profilePicture: imageUrl
      }));
    }
  };

  const handleAddExpertise = () => {
    if (expertiseInput.trim() && !formData.expertise.includes(expertiseInput.trim())) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, expertiseInput.trim()]
      }));
      setExpertiseInput('');
    }
  };

  const handleRemoveExpertise = (expertiseToRemove) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter(item => item !== expertiseToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Update profile using the service
      await updateProfile(formData);
      
      // The cache is updated in the service, and the context is updated via event listener
      setIsEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      setError(error.error || 'Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditMode && formData !== user) {
      if (confirm('Discard unsaved changes?')) {
        // Reset form data from user
        setFormData({
          fullName: user.fullName || '',
          email: user.email || '',
          studentEmail: user.studentEmail || '',
          instituteName: user.instituteName || '',
          country: user.country || '',
          location: user.location || '',
          qualification: user.qualification || '',
          course: user.course || '',
          expertise: user.expertise || [],
          bio: user.bio || '',
          profilePicture: user.profilePicture || ''
        });
        setIsEditMode(false);
      }
    } else {
      setIsEditMode(!isEditMode);
    }
  };

  if (loading.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple" />
      </div>
    );
  }

  return (
      <div className="container mx-auto px-4 py-8">
      <div className="glass-panel border-purple p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">
            {isEditMode ? 'Edit Profile' : 'My Profile'}
          </h1>
          <button
            onClick={handleEditToggle}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isEditMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-purple text-white hover:bg-purple-dark'
            }`}
          >
            {isEditMode ? (
              <>
                <X className="h-5 w-5" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Edit className="h-5 w-5" />
                <span>Edit Profile</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {isEditMode ? (
          // Edit Mode - Form View
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-black/40 border-2 border-purple mb-4">
                {(previewImage || formData.profilePicture) ? (
                  <img 
                    src={previewImage || formData.profilePicture} 
                    alt="Profile Preview" 
                className="w-full h-full object-cover"
              />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <User className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              <label className="btn-secondary px-4 py-2 cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
                Change Picture
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information Section */}
              <div className="col-span-2">
                <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">Personal Information</h3>
              </div>
              
              <div>
                <label htmlFor="fullName" className="block text-white font-semibold mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 p-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-white font-semibold mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 p-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="studentEmail" className="block text-white font-semibold mb-2">
                  Student Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="studentEmail"
                    name="studentEmail"
                    value={formData.studentEmail}
                    onChange={handleChange}
                    className="w-full pl-10 p-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple"
                  />
          </div>
        </div>
        
            <div>
                <label htmlFor="country" className="block text-white font-semibold mb-2">
                  Country
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full pl-10 p-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple"
                  />
                </div>
              </div>

                  <div>
                <label htmlFor="location" className="block text-white font-semibold mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full pl-10 p-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple"
                  />
                </div>
              </div>

              {/* Education Section */}
              <div className="col-span-2 mt-4">
                <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">Educational Background</h3>
                </div>
                
                  <div>
                <label htmlFor="instituteName" className="block text-white font-semibold mb-2">
                  Institute Name
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="instituteName"
                    name="instituteName"
                    value={formData.instituteName}
                    onChange={handleChange}
                    className="w-full pl-10 p-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple"
                  />
                </div>
                </div>
                
                  <div>
                <label htmlFor="qualification" className="block text-white font-semibold mb-2">
                  Qualification
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="w-full pl-10 p-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple"
                  />
                </div>
                </div>
                
                  <div>
                <label htmlFor="course" className="block text-white font-semibold mb-2">
                  Course
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    className="w-full pl-10 p-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple"
                  />
                </div>
              </div>
            </div>
            
            {/* Expertise Section */}
            <div className="mt-4">
              <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">Areas of Expertise</h3>
            <div>
                <label className="block text-white font-semibold mb-2">
                  Expertise
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExpertise())}
                    placeholder="Add expertise and press Enter"
                    className="flex-1 p-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple"
                  />
                  <button
                    type="button"
                    onClick={handleAddExpertise}
                    className="px-4 py-2 bg-purple text-white rounded-lg hover:bg-purple-dark transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.expertise.map((item, index) => (
                    <span
                      key={index}
                      className="flex items-center bg-black/30 text-gray-300 px-3 py-1 rounded-full"
                    >
                      <Brain className="h-4 w-4 mr-1" />
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveExpertise(item)}
                        className="ml-2 text-gray-400 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="mt-4">
              <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">About Me</h3>
              <div>
                <label htmlFor="bio" className="block text-white font-semibold mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple"
                />
        </div>
      </div>
      
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center space-x-2 px-6 py-3 bg-purple text-white rounded-lg hover:bg-purple-dark transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          // View Mode - Profile Display
          <div>
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-black/40 border-2 border-purple">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.fullName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <User className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-bold text-white">{user.fullName}</h2>
                <p className="text-gray-400">{user.email}</p>
                {user.bio && (
                  <p className="text-gray-300 mt-4 max-w-lg">{user.bio}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
                  {user.instituteName && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-white">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      {user.instituteName}
                    </span>
                  )}
                  {user.location && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-white">
                      <MapPin className="h-3 w-3 mr-1" />
                      {user.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Stats Section */}
            <div className="glass-panel p-5 border-gray-700 mb-8">
              <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">Activity Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/30 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-purple">0</p>
                  <p className="text-gray-400 text-sm">Meetings Created</p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-purple">0</p>
                  <p className="text-gray-400 text-sm">Meetings Joined</p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-purple">{user.expertise ? user.expertise.length : 0}</p>
                  <p className="text-gray-400 text-sm">Areas of Expertise</p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-purple">0</p>
                  <p className="text-gray-400 text-sm">Contributions</p>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="glass-panel p-5 border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">Personal Information</h3>
                
                <div className="space-y-4">
                  {user.studentEmail && (
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-purple mr-3 mt-1" />
                      <div>
                        <p className="text-gray-400 text-sm">Student Email</p>
                        <p className="text-white">{user.studentEmail}</p>
                      </div>
                    </div>
                  )}
                  
                  {user.location && (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-purple mr-3 mt-1" />
                      <div>
                        <p className="text-gray-400 text-sm">Location</p>
                        <p className="text-white">{user.location}</p>
                      </div>
                    </div>
                  )}
                  
                  {user.country && (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-purple mr-3 mt-1" />
                      <div>
                        <p className="text-gray-400 text-sm">Country</p>
                        <p className="text-white">{user.country}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Educational Information */}
              <div className="glass-panel p-5 border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">Educational Background</h3>
                
                <div className="space-y-4">
                  {user.instituteName && (
                    <div className="flex items-start">
                      <GraduationCap className="h-5 w-5 text-purple mr-3 mt-1" />
                      <div>
                        <p className="text-gray-400 text-sm">Institute</p>
                        <p className="text-white">{user.instituteName}</p>
                      </div>
                    </div>
                  )}
                  
                  {user.qualification && (
                    <div className="flex items-start">
                      <GraduationCap className="h-5 w-5 text-purple mr-3 mt-1" />
                      <div>
                        <p className="text-gray-400 text-sm">Qualification</p>
                        <p className="text-white">{user.qualification}</p>
                      </div>
                    </div>
                  )}
                  
                  {user.course && (
                    <div className="flex items-start">
                      <BookOpen className="h-5 w-5 text-purple mr-3 mt-1" />
                      <div>
                        <p className="text-gray-400 text-sm">Course</p>
                        <p className="text-white">{user.course}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Expertise Section */}
              {user.expertise && user.expertise.length > 0 && (
                <div className="glass-panel p-5 border-gray-700 lg:col-span-2">
                  <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">Areas of Expertise</h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {user.expertise.map((item, index) => (
                      <span key={index} className="flex items-center bg-black/30 text-gray-300 px-3 py-1 rounded-full">
                        <Brain className="h-4 w-4 mr-1" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
        </div>
        )}
    </div>
    </div>
  );
};

export default Profile;