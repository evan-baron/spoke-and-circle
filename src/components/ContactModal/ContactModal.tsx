"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MailIcon, PhoneIcon, WebsiteIcon } from "@/components/ContactIcons/ContactIcons";
import styles from "./contactModal.module.scss";

interface ContactModalProps {
  teamName: string;
  email?: string;
  phone?: string;
  website?: string;
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
