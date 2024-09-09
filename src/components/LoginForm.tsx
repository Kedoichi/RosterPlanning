import React from "react";

interface LoginFormProps {
  formData: {
    email: string;
    password: string;
    businessCode: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  formData,
  handleChange,
  handleSubmit,
}) => (
  <form onSubmit={handleSubmit} className="max-w-md mx-auto">
    <div className="mb-4">
      <label
        htmlFor="businessCode"
        className="block text-sm font-medium text-gray-700"
      >
        Business Code
      </label>
      <input
        id="businessCode"
        name="businessCode"
        type="text"
        required
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        value={formData.businessCode}
        onChange={handleChange}
      />
    </div>
    <div className="mb-4">
      <label
        htmlFor="email"
        className="block text-sm font-medium text-gray-700"
      >
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        value={formData.email}
        onChange={handleChange}
      />
    </div>
    <div className="mb-6">
      <label
        htmlFor="password"
        className="block text-sm font-medium text-gray-700"
      >
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        value={formData.password}
        onChange={handleChange}
      />
    </div>
    <div className="flex items-center justify-between">
      <button
        type="submit"
        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
      >
        Sign in
      </button>
    </div>
  </form>
);