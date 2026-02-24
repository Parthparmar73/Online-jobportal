export function getUsers() {
  const users = localStorage.getItem("users");
  return users ? JSON.parse(users) : [];
}

export function saveUser(user) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));
}

export function findUser(email, password) {
  const users = getUsers();
  return users.find(u => u.email === email && u.password === password);
}
