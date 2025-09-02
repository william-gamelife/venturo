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
    // 使用 localStorage 代替 sessionStorage，但加上過期時間
    const loginData = {
      uuid: user.uuid,
      display_name: user.display_name,
      role: user.role,
      username: user.username,
      title: user.title,
      avatar: user.avatar,
      loginTime: Date.now(),
      // 設定 7 天過期
      expireTime: Date.now() + (7 * 24 * 60 * 60 * 1000)
    };
    
    localStorage.setItem('gamelife_auth', JSON.stringify(loginData));
    
    // 同時保留 sessionStorage 以確保相容性
    sessionStorage.setItem('user_uuid', user.uuid);
    sessionStorage.setItem('display_name', user.display_name);
    sessionStorage.setItem('role', user.role);
    sessionStorage.setItem('username', user.username);
    sessionStorage.setItem('title', user.title);
    sessionStorage.setItem('avatar', user.avatar);
    
    return { 
      success: true, 
      user: loginData
    };
  } catch (error) {
    return { success: false, message: '登入失敗，請稍後再試' };
  }
}

function getCurrentUser() {
  try {
    // 先檢查新格式的 currentUser (from index.html)
    const currentUserData = sessionStorage.getItem('currentUser');
    if (currentUserData) {
      const data = JSON.parse(currentUserData);
      if (data.uuid) {
        return data;
      }
    }
    
    // 再檢查 localStorage
    const authData = localStorage.getItem('gamelife_auth');
    if (authData) {
      const data = JSON.parse(authData);
      
      // 檢查是否過期
      if (data.expireTime && Date.now() < data.expireTime) {
        // 同步到 sessionStorage
        sessionStorage.setItem('user_uuid', data.uuid);
        sessionStorage.setItem('display_name', data.display_name);
        sessionStorage.setItem('role', data.role);
        sessionStorage.setItem('username', data.username);
        sessionStorage.setItem('title', data.title);
        sessionStorage.setItem('avatar', data.avatar);
        
        return {
          uuid: data.uuid,
          display_name: data.display_name,
          role: data.role,
          username: data.username,
          title: data.title,
          avatar: data.avatar
        };
      } else {
        // 過期了，清除
        localStorage.removeItem('gamelife_auth');
      }
    }
    
    // 最後檢查舊格式的 sessionStorage
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
  // 先檢查新格式的 currentUser
  const currentUserData = sessionStorage.getItem('currentUser');
  if (currentUserData) {
    try {
      const data = JSON.parse(currentUserData);
      if (data.uuid) {
        return true;
      }
    } catch (error) {
      sessionStorage.removeItem('currentUser');
    }
  }
  
  // 再檢查 localStorage
  const authData = localStorage.getItem('gamelife_auth');
  if (authData) {
    try {
      const data = JSON.parse(authData);
      // 檢查是否過期
      if (data.expireTime && Date.now() < data.expireTime) {
        return true;
      } else {
        // 過期了，清除
        localStorage.removeItem('gamelife_auth');
      }
    } catch (error) {
      localStorage.removeItem('gamelife_auth');
    }
  }
  
  // 最後檢查舊格式的 sessionStorage
  return sessionStorage.getItem('user_uuid') !== null;
}

function logout() {
  try {
    // 清除新格式
    sessionStorage.removeItem('currentUser');
    
    // 清除 localStorage
    localStorage.removeItem('gamelife_auth');
    
    // 清除舊格式的 sessionStorage
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