const users = [
  {
    uuid: '550e8400-e29b-41d4-a716-446655440001',
    username: 'william',
    display_name: 'William',
    password: 'pass1234',
    role: 'admin',
    title: 'IT主管',
    avatar: '👨‍💼'
  },
  {
    uuid: '550e8400-e29b-41d4-a716-446655440002',
    username: 'carson',
    display_name: 'Carson',
    password: 'pass1234',
    role: 'admin',
    title: '工程師',
    avatar: '👨‍💻'
  },
  {
    uuid: '550e8400-e29b-41d4-a716-446655440003',
    username: 'jess',
    display_name: 'Jess',
    password: 'pass1234',
    role: 'user',
    title: '專案經理',
    avatar: '👩‍💼'
  }
];

function validateLogin(username, password) {
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  
  if (!user) {
    return { success: false, message: '找不到此使用者' };
  }
  
  if (user.password !== password) {
    return { success: false, message: '密碼錯誤' };
  }
  
  try {
    sessionStorage.setItem('user_uuid', user.uuid);
    sessionStorage.setItem('display_name', user.display_name);
    sessionStorage.setItem('role', user.role);
    sessionStorage.setItem('username', user.username);
    sessionStorage.setItem('title', user.title);
    sessionStorage.setItem('avatar', user.avatar);
    
    return { 
      success: true, 
      user: {
        uuid: user.uuid,
        display_name: user.display_name,
        role: user.role,
        username: user.username,
        title: user.title,
        avatar: user.avatar
      }
    };
  } catch (error) {
    return { success: false, message: '登入失敗，請稍後再試' };
  }
}

function getCurrentUser() {
  try {
    const uuid = sessionStorage.getItem('user_uuid');
    if (!uuid) return null;
    
    return {
      uuid: uuid,
      display_name: sessionStorage.getItem('display_name'),
      role: sessionStorage.getItem('role'),
      username: sessionStorage.getItem('username'),
      title: sessionStorage.getItem('title'),
      avatar: sessionStorage.getItem('avatar')
    };
  } catch (error) {
    return null;
  }
}

function isLoggedIn() {
  return sessionStorage.getItem('user_uuid') !== null;
}

function logout() {
  try {
    sessionStorage.removeItem('user_uuid');
    sessionStorage.removeItem('display_name');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('title');
    sessionStorage.removeItem('avatar');
    
    window.location.href = './index.html';
  } catch (error) {
    console.error('登出失敗:', error);
    window.location.href = './index.html';
  }
}

function getUserByUsername(username) {
  return users.find(u => u.username.toLowerCase() === username.toLowerCase());
}

export {
  users,
  validateLogin,
  getCurrentUser,
  isLoggedIn,
  logout,
  getUserByUsername
};