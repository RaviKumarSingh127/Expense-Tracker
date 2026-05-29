import { motion } from "framer-motion";
import { clsx } from "clsx";

export default function Card({ children, className = "", hover = false, onClick, ...props }) {
  const Tag = onClick || hover ? motion.div : "div";
  const motionProps = onClick || hover
    ? { whileHover: { y: -2, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }, transition: { duration: 0.2 } }
    : {};

  return (
    <Tag
      className={clsx("glass-card p-6", hover && "cursor-pointer", className)}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </Tag>
  );
}
