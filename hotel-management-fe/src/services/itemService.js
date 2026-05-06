const API_URL = '/api/items';

const getItems = async () => {
  const res = await fetch(API_URL);
  return res.json();
};

const createItem = async (item) => {
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
};

export default { getItems, createItem };
