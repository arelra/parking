import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { validatePostcode } from '../utils/postcode';

interface PostcodeFormProps {
  onSubmit: (postcode: string) => void;
}

export function PostcodeForm({ onSubmit }: PostcodeFormProps) {
  const [postcode, setPostcode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!await validatePostcode(postcode)) {
      setError('Please enter a valid UK postcode');
      return;
    }

    onSubmit(postcode);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          placeholder="Enter UK postcode (e.g., SW1A 1AA)"
          className="w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-blue-500"
        >
          <Search size={20} />
        </button>
      </div>
      {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
    </form>
  );
}