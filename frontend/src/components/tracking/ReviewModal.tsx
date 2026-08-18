import React, { useState } from 'react';
import { Star, X, CheckCircle2, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReviewModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ orderId, isOpen, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:4000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, rating, comment: comment.trim() })
      });

      if (res.ok) {
        setSubmitted(true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Erro ao enviar avaliação:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-wood-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden p-6 text-center space-y-6">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-white">Grazie Mille!</h3>
            <p className="text-xs text-stone-300">
              Sua avaliação foi registrada no nosso sistema e nos ajuda a manter a tradição napolitana sempre impecável.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <h3 className="text-xl font-serif font-bold text-white">Como foi sua Experiência?</h3>
              <p className="text-xs text-stone-400">Avalie a qualidade da pizza e a pontualidade da entrega</p>
            </div>

            {/* Star Picker */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                        : 'text-stone-600'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Comment Text Area */}
            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Deixe um comentário sobre a massa, o queijo derretido, a embalagem..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-tomato-700 to-tomato-600 hover:from-tomato-600 hover:to-tomato-500 text-white font-bold text-sm shadow-glow-tomato transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{loading ? 'Gravando...' : 'Enviar Avaliação Real'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
