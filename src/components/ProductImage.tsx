"use client"; // Es fundamental que esto esté en la primera línea

import Image from "next/image";
import { useState } from "react";

interface ProductImageProps {
  src: string;
  alt: string;
}

export default function ProductImage({ src, alt }: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover"
      priority // Carga esta imagen rápido porque es la principal
      sizes="(max-w-md) 100vw, 50vw"
      onError={() => {
        setImgSrc('/images/placeholder.jpg'); // El comodín salvador
      }}
    />
  );
}