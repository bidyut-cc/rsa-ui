export default function useAuth() {
    const auth = localStorage.getItem('token') ? true : false;;
  
    return auth;
  }