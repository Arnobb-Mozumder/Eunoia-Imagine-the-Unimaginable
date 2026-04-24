
export function isAdmin() {
  return sessionStorage.getItem('isAdmin') === 'true'
}

export function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast')
  if (!toast) return
  toast.textContent = msg
  toast.classList.remove('hidden')
  requestAnimationFrame(() => {
    toast.classList.add('show')
    setTimeout(() => {
      toast.classList.remove('show')
      setTimeout(() => toast.classList.add('hidden'), 300)
    }, duration)
  })
}
