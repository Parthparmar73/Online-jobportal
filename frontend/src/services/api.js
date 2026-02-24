export async function apiGet(path) {
  const res = await fetch(`/api/${path}`);
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`/api/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function apiPostForm(path, formData) {
  const res = await fetch(`/api/${path}`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}
