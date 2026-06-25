import { statusBadge } from '../utils/badge.js'

export default function Badge({ status, children }) {
  const { className, label } = statusBadge(status)
  return <span className={`badge ${className}`}>{children || label}</span>
}
