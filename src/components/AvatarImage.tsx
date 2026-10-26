import React, { useState } from 'react';
import { User } from 'lucide-react';

export interface AvatarImageProps {
  src?: string | null;
  alt?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  iconClassName?: string;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  src,
  alt = '',
  imageClassName = 'h-full w-full object-cover',
  fallbackClassName = 'grid h-full w-full place-items-center text-neutral-400',
  iconClassName = 'h-[22px] w-[22px]'
}) => {
  const [hasError, setHasError] = useState(false);

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={alt}
        className={imageClassName}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div className={fallbackClassName} aria-hidden="true">
      <User className={iconClassName} />
    </div>
  );
};
