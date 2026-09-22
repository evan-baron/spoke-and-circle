"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./contactModal.module.scss";

interface ContactModalProps {
  teamName: string;
  email?: string;
  phone?: string;
  website?: string;
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M4 7l8 6 8-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M5 4h3l1.5 4.5L7.5 10a12 12 0 0 0 6.5 6.5l1.5-2 4.5 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 3 6.2 2 2 0 0 1 5 4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WebsiteIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9s1.3-6.4 3.8-9z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ContactModal({ teamName, email, phone, website }: ContactModalProps) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!email && !phone && !website) return null;

  return (
    <>
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)}>
        Contact team
      </button>

      {open &&
        createPortal(
          <div className={styles.overlay} onClick={() => setOpen(false)}>
            <div
              className={styles.panel}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                ref={closeRef}
                type="button"
                className={styles.closeBtn}
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <CloseIcon />
              </button>

              <p className={styles.eyebrow}>Contact</p>
              <h2 id={titleId}>{teamName}</h2>

              <div className={styles.list}>
                <div className={styles.row}>
                  <span className={styles.icon} aria-hidden="true">
                    <MailIcon />
                  </span>
                  {email ? (
                    <a href={`mailto:${email}`}>{email}</a>
                  ) : (
                    <span className={styles.notListed}>Not listed</span>
                  )}
                </div>
                <div className={styles.row}>
                  <span className={styles.icon} aria-hidden="true">
                    <PhoneIcon />
                  </span>
                  {phone ? (
                    <a href={`tel:${phone}`}>{phone}</a>
                  ) : (
                    <span className={styles.notListed}>Not listed</span>
                  )}
                </div>
                <div className={styles.row}>
                  <span className={styles.icon} aria-hidden="true">
                    <WebsiteIcon />
                  </span>
                  {website ? (
                    <a href={website} target="_blank" rel="noopener noreferrer">
                      {website}
                    </a>
                  ) : (
                    <span className={styles.notListed}>Not listed</span>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
