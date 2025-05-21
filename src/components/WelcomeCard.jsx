import React from 'react';

const WelcomeCard = ({ userName }) => {
  const currentHour = new Date().getHours();
  let greeting = "Welcome";
  
  if (currentHour < 12) {
    greeting = "Good Morning";
  } else if (currentHour < 18) {
    greeting = "Good Afternoon";
  } else {
    greeting = "Good Evening";
  }

  return (
    <div className="glass-panel p-6 animate-fade-in mb-6">
      <h1 className="text-2xl font-bold text-white mb-2">
        {greeting}, <span className="text-purple">{userName || 'Student'}</span>!
      </h1>
      <p className="text-gray-300">
        Ready to connect with peers and share knowledge? Create or join a meeting to get started.
      </p>
    </div>
  );
};

export default WelcomeCard;
