import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
}

export function StarRating({ rating, max = 5, size = 14 }: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < rating ? "#F9A825" : "transparent"}
          color={i < rating ? "#F9A825" : "#9ca3af"}
        />
      ))}
    </div>
  );
}
