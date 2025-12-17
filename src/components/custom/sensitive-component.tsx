"use client";

import { Eye, EyeOff } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";

/** Displays a blurred component with the option to blur/unblur it.
 * @param children The HTML to display.
 * @param secureLength If not set to null, will always display a garbage string UNLESS the view button is clicked. More secure.
 */
export default function SensitiveComponent({
  children,
  blurAmount = 8,
  secureLength = null,
  transitionMS = 200,
}: {
  children: ReactNode;
  blurAmount?: number;
  secureLength?: number | null;
  transitionMS?: number;
}) {
  const [visible, setVisible] = useState(false);
  const [garbage, setGarbage] = useState<string | null>(() =>
    secureLength ? generateGarbageString(secureLength) : null
  );
  const [showGarbage, setShowGarbage] = useState(!!secureLength);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  function generateGarbageString(length: number) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    return Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  }

  function handleToggle() {
    // Revealing
    if (!visible) {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      setShowGarbage(false);
      setVisible(true);
      return;
    }

    // Hiding
    setVisible(false);

    if (secureLength) {
      hideTimeoutRef.current = setTimeout(() => {
        setGarbage(generateGarbageString(secureLength));
        setShowGarbage(true);
      }, transitionMS);
    }
  }

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      {/* Eye toggle */}
      <button onClick={handleToggle} className="p-1 rounded hover:bg-accent">
        {visible ? (
          <EyeOff className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Eye className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      <span
        className="transition-all duration-200"
        style={{
          filter: visible ? "none" : `blur(${blurAmount}px)`,
          userSelect: visible ? "auto" : "none",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {showGarbage && garbage ? garbage : children}
      </span>
    </div>
  );
}
