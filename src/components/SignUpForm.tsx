import React from "react";

interface SignUpFormProps {
  formData: {
    name: string;
    phone: string;
    email: string;
    password: string;
    businessCode: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  formData,
  handleChange,
  handleSubmit,
}) => (
  <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
    <input type="hidden" name="remember" defaultValue="true" />
    <div className="rounded-md shadow-sm -space-y-px">
      <input
        name="name"
        type="text"
        autoComplete="name"
        required
        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
        placeholder="Full name"
        value={formData.name}
        onChange={handleChange}
      />
      <input
        name="phone"
        type="tel"
        autoComplete="tel"
        required
        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
        placeholder="Phone number"
        value={formData.phone}
        onChange={handleChange}
      />
      <input
        name="email"
        type="email"
        autoComplete="email"
        required
        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
        placeholder="Email address"
        value={formData.email}
        onChange={handleChange}
      />
      <input
        name="password"
        type="password"
        autoComplete="new-password"
        required
        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
      />
      <input
        name="businessCode"
        type="text"
        autoComplete="off"
        required
        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
        placeholder="Business Code"
        value={formData.businessCode}
        onChange={handleChange}
      />
    </div>
    <div>
      <button
        type="submit"
        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Sign Up
      </button>
    </div>
  </form>
);