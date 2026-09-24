"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "./PhotoGallery.module.css";

interface PhotoGalleryProps {
  images: string[];
  title: string;
  variant?: "grid" | "hero";
  status?: string;
  coverImage?: string;
  heroHeight?: string;
  maxDisplay?: number;
  showSectionHeader?: boolean;
}

export default function PhotoGallery({
  images,
  title,
  variant = "grid",
  status,
  coverImage,
  heroHeight,
  maxDisplay = 6,
  showSectionHeader = true,
}: PhotoGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const thumbnailsContainerRef = useRef<HTMLDivElement | null>(null);

  // Normalize images array
  const validImages = Array.isArray(images)
    ? images.filter((img) => typeof img === "string" && img.trim().length > 0)
    : [];

  const mainCover =
    coverImage ||
    (validImages.length > 0
      ? validImages[0]
      : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80");

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsZoomed(false);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
    setIsZoomed(false);
  };

  const nextPhoto = useCallback(() => {
    if (validImages.length <= 1) return;
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  }, [validImages.length]);

  const prevPhoto = useCallback(() => {
    if (validImages.length <= 1) return;
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  }, [validImages.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        nextPhoto();
      } else if (e.key === "ArrowLeft") {
        prevPhoto();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, nextPhoto, prevPhoto]);

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (!isOpen || !thumbnailsContainerRef.current) return;
    const container = thumbnailsContainerRef.current;
    const activeThumb = container.children[currentIndex] as HTMLElement;
    if (activeThumb) {
      const containerWidth = container.clientWidth;
      const thumbOffset = activeThumb.offsetLeft;
      const thumbWidth = activeThumb.clientWidth;
      container.scrollTo({
        left: thumbOffset - containerWidth / 2 + thumbWidth / 2,
        behavior: "smooth",
      });
    }
  }, [currentIndex, isOpen]);

  // Mobile Touch Gestures (Swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const diffX = touchStartXRef.current - touchEndXRef.current;
    const swipeThreshold = 50; // px

    if (diffX > swipeThreshold) {
      nextPhoto(); // swiped left -> go next
    } else if (diffX < -swipeThreshold) {
      prevPhoto(); // swiped right -> go prev
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Fullscreen toggle
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const displayedImages = validImages.slice(0, maxDisplay);
  const remainingCount = validImages.length - maxDisplay;

  // Render Lightbox Modal
  const renderLightbox = () => {
    if (!isOpen || validImages.length === 0) return null;

    return (
      <div
        className={styles.lightboxOverlay}
        role="dialog"
        aria-modal="true"
        aria-label={`${title} Photo Gallery`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            closeLightbox();
          }
        }}
      >
        {/* Lightbox Header */}
        <div className={styles.lightboxHeader}>
          <div className={styles.lightboxTitleGroup}>
            <span className={styles.lightboxTitle}>{title}</span>
            <span className={styles.lightboxCounter}>
              Photo {currentIndex + 1} of {validImages.length}
            </span>
          </div>

          <div className={styles.lightboxActions}>
            <button
              type="button"
              className={styles.lightboxActionBtn}
              onClick={() => setIsZoomed((prev) => !prev)}
              title={isZoomed ? "Zoom out" : "Zoom in"}
              aria-label="Toggle zoom"
            >
              <i className={`fa-solid ${isZoomed ? "fa-magnifying-glass-minus" : "fa-magnifying-glass-plus"}`}></i>
            </button>

            <button
              type="button"
              className={styles.lightboxActionBtn}
              onClick={toggleFullScreen}
              title="Toggle full screen"
              aria-label="Toggle full screen"
            >
              <i className="fa-solid fa-expand"></i>
            </button>

            <button
              type="button"
              className={`${styles.lightboxActionBtn} ${styles.closeBtn}`}
              onClick={closeLightbox}
              title="Close gallery (Esc)"
              aria-label="Close photo gallery"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* Main Stage (Single Image View) */}
        <div
          className={styles.lightboxStage}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeLightbox();
            }
          }}
        >
          {validImages.length > 1 && (
            <button
              type="button"
              className={`${styles.navArrow} ${styles.navArrowLeft}`}
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
              title="Previous photo (Left arrow key)"
              aria-label="Previous photo"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
          )}

          <div className={styles.stageImageWrapper}>
            <img
              key={currentIndex}
              src={validImages[currentIndex]}
              alt={`${title} - Photo ${currentIndex + 1}`}
              className={`${styles.stageImage} ${isZoomed ? styles.isZoomed : ""}`}
              onClick={() => setIsZoomed((prev) => !prev)}
              title="Click to zoom in/out"
            />
          </div>

          {validImages.length > 1 && (
            <button
              type="button"
              className={`${styles.navArrow} ${styles.navArrowRight}`}
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
              title="Next photo (Right arrow key)"
              aria-label="Next photo"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          )}
        </div>

        {/* Thumbnail Carousel Bar */}
        {validImages.length > 1 && (
          <div
            className={styles.lightboxThumbnails}
            ref={thumbnailsContainerRef}
          >
            {validImages.map((img, idx) => (
              <div
                key={idx}
                className={`${styles.thumbnailItem} ${idx === currentIndex ? styles.activeThumbnail : ""}`}
                onClick={() => {
                  setIsZoomed(false);
                  setCurrentIndex(idx);
                }}
                title={`Go to photo ${idx + 1}`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // If Hero Variant
  if (variant === "hero") {
    return (
      <>
        <div
          className={styles.heroBanner}
          style={heroHeight ? { height: heroHeight } : undefined}
          onClick={() => openLightbox(0)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") openLightbox(0);
          }}
          title="Click to open full photo gallery"
        >
          <img src={mainCover} alt={title} />
          {status === "SOLD" && <div className={styles.soldBadge}>SOLD</div>}

          {validImages.length > 0 && (
            <div className={styles.heroBadgeTrigger}>
              <i className="fa-solid fa-images"></i>
              <span>View Photos ({validImages.length})</span>
            </div>
          )}
        </div>

        {renderLightbox()}
      </>
    );
  }

  // If Grid Variant
  if (validImages.length === 0) return null;

  return (
    <div className={styles.gallerySection}>
      {showSectionHeader && (
        <div className={styles.galleryHeader}>
          <h3 className={styles.galleryTitle}>
            <i className="fa-solid fa-camera-retro" style={{ color: "var(--accent-color, #d4af37)" }}></i>
            Photo Gallery
            <span style={{ fontSize: "0.85rem", color: "var(--text-light, #64748b)", fontWeight: 500 }}>
              ({validImages.length} {validImages.length === 1 ? "photo" : "photos"})
            </span>
          </h3>

          <button
            type="button"
            className={styles.viewAllBtn}
            onClick={() => openLightbox(0)}
            title="Open photo gallery in full screen"
          >
            <i className="fa-solid fa-expand"></i> View All Photos
          </button>
        </div>
      )}

      {/* Grid of photos */}
      <div className={styles.gridContainer}>
        {displayedImages.map((img, idx) => {
          const isLastItemWithMore = idx === maxDisplay - 1 && remainingCount > 0;

          return (
            <div
              key={idx}
              className={styles.gridItem}
              onClick={() => openLightbox(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  openLightbox(idx);
                }
              }}
              title={`View photo ${idx + 1}`}
            >
              <img
                src={img}
                alt={`${title} - view ${idx + 1}`}
                loading={idx < 2 ? "eager" : "lazy"}
              />

              {isLastItemWithMore ? (
                <div className={styles.moreCountOverlay}>
                  +{remainingCount + 1}
                  <span>View All</span>
                </div>
              ) : (
                <div className={styles.imageOverlay}>
                  <span className={styles.expandBadge}>
                    <i className="fa-solid fa-up-right-and-down-left-and-up-right-to-center"></i> View
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {renderLightbox()}
    </div>
  );
}
