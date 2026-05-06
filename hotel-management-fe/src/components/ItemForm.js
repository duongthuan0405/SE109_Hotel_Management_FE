import React, { useState } from 'react';

function ItemForm({ onAddItem }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;
    onAddItem({ name, description });
    setName('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
      <input
        type="text"
        placeholder="Item name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <button type="submit">Add Item</button>
    </form>
  );
}

export default ItemForm;
