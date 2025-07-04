import { cn, racing, spicy } from "@/lib/utils";
import { useEffect } from "react";

function EmailForm({
  email,
  setEmail,
  termsAgreed,
  setTermsAgreed,
  onCancel,
  onSubmit,
  emailInputRef,
}: {
  email: string;
  setEmail: (v: string) => void;
  termsAgreed: boolean;
  setTermsAgreed: (v: boolean) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  emailInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [emailInputRef]);

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.8)] flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-[#ffd6a0] p-6 rounded-none shadow-neo max-w-md w-full border-2 border-black relative">
        <h3
          className={cn(
            "text-2xl font-bold text-black mb-2 text-center",
            racing.className
          )}
        >
          COMPLETE YOUR INFORMATION
        </h3>
        <p
          className={cn("text-sm text-black mb-6 text-center", spicy.className)}
        >
          Provide Your Email And Agree To Our Terms Before Swapping Your NFT
        </p>
        <form onSubmit={onSubmit} className="border-t-2 border-black pt-4">
          <div className="mb-4">
            <label
              htmlFor="email"
              className={cn(
                "block text-sm font-bold text-black mb-1",
                spicy.className
              )}
            >
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              id="email"
              ref={emailInputRef}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black bg-white shadow-neo-sm rounded-none focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-1 mr-2 border-2 border-black"
                required
              />
              <span className={cn("text-sm text-black", spicy.className)}>
                I Agree To The{" "}
                <a
                  href="/terms"
                  target="_blank"
                  className="text-orange-600 hover:underline font-bold"
                >
                  TERMS AND CONDITIONS
                </a>{" "}
                AND{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  className="text-orange-600 hover:underline font-bold"
                >
                  PRIVACY POLICY
                </a>
              </span>
            </label>
          </div>
          <div className="flex justify-between pt-2 border-t-2 border-black">
            <button
              type="button"
              onClick={onCancel}
              className={cn(
                "px-4 py-2 bg-white text-black border-2 border-black font-bold rounded-none shadow-neo hover:bg-gray-100 transition-colors",
                spicy.className
              )}
            >
              CANCEL
            </button>
            <button
              type="submit"
              className={cn(
                "px-4 py-2 bg-gradient-to-b from-yellow-400 to-orange-400 text-black border-2 border-black font-bold rounded-none shadow-neo hover:from-yellow-500 hover:to-orange-500 transition-colors",
                spicy.className
              )}
            >
              SUBMIT & SWAP NFT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmailForm;
