export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8
}

export function isValidBusinessName(name: string): boolean {
  return name.trim().length >= 2
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length >= 3
}
