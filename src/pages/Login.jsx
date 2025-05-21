import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, BookOpen, MapPin, Building, Flag, Loader2, Brain } from 'lucide-react';
import { register, login } from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    instituteName: '',
    country: '',
    qualification: '',
    course: '',
    expertise: '',
    location: '',
    studentEmail: '',
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!isLogin) {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      }
      if (!formData.instituteName) {
        newErrors.instituteName = 'Institute name is required';
      }
      if (!formData.country) {
        newErrors.country = 'Country is required';
      }
      if (!formData.location) {
        newErrors.location = 'Location is required';
      }
      if (!formData.qualification) {
        newErrors.qualification = 'Qualification is required';
      }
      if (!formData.course) {
        newErrors.course = 'Course is required';
      }
      if (!formData.expertise) {
        newErrors.expertise = 'Expertise areas are required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({}); // Clear any previous errors
    
    try {
      if (isLogin) {
        // Call login with separate email and password parameters
        await login(formData.email, formData.password);
      } else {
        // Split expertise into array and trim each item
        const expertiseArray = formData.expertise
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0);
        
        await register({
          ...formData,
          expertise: expertiseArray
        });
      }
    navigate('/');
    } catch (error) {
      // Handle different types of errors
      if (error.message.includes('Invalid login credentials')) {
        setErrors({ submit: 'Invalid email or password' });
      } else if (error.message.includes('Email already exists')) {
        setErrors({ submit: 'An account with this email already exists' });
      } else if (error.message.includes('Registration failed')) {
        setErrors({ submit: 'Registration failed. Please try again.' });
      } else {
        setErrors({ submit: error.message || 'An error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData(prev => ({
      ...prev,
      password: '' // Clear password when switching forms
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel border-purple w-full max-w-md p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-10 w-10 text-purple" />
          <h1 className="text-3xl font-bold text-white">Knowledge<span className="text-purple">Connect</span></h1>
          </div>
          <p className="text-gray-300">Connect with fellow students and share knowledge</p>
        </div>

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-sm">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {isLogin ? (
            <>
              <div>
                <label htmlFor="email" className="text-gray-300 mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 w-full p-3 bg-black/30 border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple`}
                    placeholder="Your email address"
                    required
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="text-gray-300 mb-1 block">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full p-3 bg-black/30 border ${errors.password ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple`}
                  placeholder="Your password"
                  required
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                {errors.password && (
                  <p id="password-error" className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="fullName" className="text-gray-300 mb-1 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`pl-10 w-full p-3 bg-black/30 border ${errors.fullName ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple`}
                    placeholder="Your full name"
                    required
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? "fullName-error" : undefined}
                  />
                </div>
                {errors.fullName && (
                  <p id="fullName-error" className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="text-gray-300 mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 w-full p-3 bg-black/30 border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple`}
                    placeholder="Your email address"
                    required
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="studentEmail" className="text-gray-300 mb-1 block">Student Email (Optional)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="studentEmail"
                    value={formData.studentEmail}
                    onChange={handleChange}
                    className={`pl-10 w-full p-3 bg-black/30 border ${errors.studentEmail ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple`}
                    placeholder="Your student email (if applicable)"
                    aria-invalid={!!errors.studentEmail}
                    aria-describedby={errors.studentEmail ? "studentEmail-error" : undefined}
                  />
                </div>
                {errors.studentEmail && (
                  <p id="studentEmail-error" className="mt-1 text-sm text-red-500">{errors.studentEmail}</p>
                )}
              </div>

              <div>
                <label htmlFor="instituteName" className="text-gray-300 mb-1 block">Institute Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="instituteName"
                    type="text"
                    name="instituteName"
                    value={formData.instituteName}
                    onChange={handleChange}
                    className={`pl-10 w-full p-3 bg-black/30 border ${errors.instituteName ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple`}
                    placeholder="Your university or college"
                    required
                    aria-invalid={!!errors.instituteName}
                    aria-describedby={errors.instituteName ? "instituteName-error" : undefined}
                  />
                </div>
                {errors.instituteName && (
                  <p id="instituteName-error" className="mt-1 text-sm text-red-500">{errors.instituteName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="country" className="text-gray-300 mb-1 block">Country</label>
                  <div className="relative">
                    <Flag className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="country"
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={`pl-10 w-full p-3 bg-black/30 border ${errors.country ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple`}
                      placeholder="Your country"
                      required
                      aria-invalid={!!errors.country}
                      aria-describedby={errors.country ? "country-error" : undefined}
                    />
                  </div>
                  {errors.country && (
                    <p id="country-error" className="mt-1 text-sm text-red-500">{errors.country}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="location" className="text-gray-300 mb-1 block">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      id="location"
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`pl-10 w-full p-3 bg-black/30 border ${errors.location ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple`}
                      placeholder="City, State"
                      required
                      aria-invalid={!!errors.location}
                      aria-describedby={errors.location ? "location-error" : undefined}
                    />
                  </div>
                  {errors.location && (
                    <p id="location-error" className="mt-1 text-sm text-red-500">{errors.location}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="qualification" className="text-gray-300 mb-1 block">Current Qualification</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    id="qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className={`pl-10 w-full p-3 bg-black/30 border ${errors.qualification ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple`}
                    required
                    aria-invalid={!!errors.qualification}
                    aria-describedby={errors.qualification ? "qualification-error" : undefined}
                  >
                    <option value="">Select qualification</option>
                    <option value="High School">High School</option>
                    <option value="Associate's Degree">Associate's Degree</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Doctoral Degree">Doctoral Degree</option>
                  </select>
                </div>
                {errors.qualification && (
                  <p id="qualification-error" className="mt-1 text-sm text-red-500">{errors.qualification}</p>
                )}
              </div>

              <div>
                <label htmlFor="course" className="text-gray-300 mb-1 block">Pursuing Course</label>
                <input
                  id="course"
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className={`w-full p-3 bg-black/30 border ${errors.course ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple`}
                  placeholder="e.g. Computer Science, Biology, etc."
                  required
                  aria-invalid={!!errors.course}
                  aria-describedby={errors.course ? "course-error" : undefined}
                />
                {errors.course && (
                  <p id="course-error" className="mt-1 text-sm text-red-500">{errors.course}</p>
                )}
              </div>

              <div>
                <label htmlFor="expertise" className="text-gray-300 mb-1 block">Expertise Areas</label>
                <input
                  id="expertise"
                  type="text"
                  name="expertise"
                  value={formData.expertise}
                  onChange={handleChange}
                  className={`w-full p-3 bg-black/30 border ${errors.expertise ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple`}
                  placeholder="e.g. Mathematics, Programming, Literature (comma separated)"
                  required
                  aria-invalid={!!errors.expertise}
                  aria-describedby={errors.expertise ? "expertise-error" : undefined}
                />
                {errors.expertise && (
                  <p id="expertise-error" className="mt-1 text-sm text-red-500">{errors.expertise}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="text-gray-300 mb-1 block">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full p-3 bg-black/30 border ${errors.password ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple`}
                  placeholder="Create a password"
                  required
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                {errors.password && (
                  <p id="password-error" className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="w-full py-3 bg-purple hover:bg-purple-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                {isLogin ? 'Logging in...' : 'Creating account...'}
              </div>
            ) : (
              isLogin ? 'Login' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-300">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              type="button"
              onClick={toggleForm}
              className="text-purple hover:text-purple-dark ml-1 font-medium"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;