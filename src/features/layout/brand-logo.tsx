import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import logoDark from "@/assets/shreehari-logo.png";
import logoLight from "@/assets/logo.jpg";
import mark from "@/assets/shreehari-mark.png";

type BrandLogoProps = {
  variant?: "header" | "light" | "mark";
  className?: string;
};

export function BrandLogo({ variant = "header", className }: Readonly<BrandLogoProps>) {
  if (variant === "mark") {
    return (
      <img
        src={mark}
        alt="Shreehari"
        className={cn("h-9 w-9 rounded-lg object-cover ring-1 ring-white/10", className)}
      />
    );
  }

  const src = variant === "light" ? logoLight : logoDark;
  return (
    <Link to="/" className={cn("flex items-center min-w-0", className)}>
      <img
        src={src}
        alt="Shreehari Export House"
        className={cn(
          "object-contain object-left",
          variant === "header" ? "h-10 w-auto max-w-[240px]" : "h-9 w-auto max-w-[200px]",
        )}
      />
    </Link>
  );
}
