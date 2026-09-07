"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Heart,
  ShoppingCart,
  Zap,
  Tag,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  MessageSquarePlus,
  X,
} from "lucide-react";
import { formatINR } from "@/lib/indian-data";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

export default function ProductDetailClient({ product }: { product: any }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  // Review Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const isFavorite = isInWishlist(product.id);
  const effectivePrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= (product.minStockQuantity || 5);

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [
          {
            url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80",
            isThumbnail: true,
          },
        ];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        price: product.price,
        discountPrice: product.discountPrice,
        gstPercentage: product.gstPercentage,
        stockQuantity: product.stockQuantity,
        unit: product.unit,
        images: product.images || [{ url: images[0].url, isThumbnail: true }],
        category: product.category,
        brand: product.brand,
      },
      quantity
    );

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        price: product.price,
        discountPrice: product.discountPrice,
        gstPercentage: product.gstPercentage,
        stockQuantity: product.stockQuantity,
        unit: product.unit,
        images: product.images || [{ url: images[0].url, isThumbnail: true }],
        category: product.category,
        brand: product.brand,
      },
      quantity
    );
    router.push("/checkout");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    setSubmittingReview(true);
    setReviewMessage("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviewMessage("Thank you! Your verified review has been submitted.");
        setTimeout(() => {
          setShowReviewModal(false);
          router.refresh();
        }, 1200);
      } else {
        setReviewMessage(data.error || "Failed to submit review");
      }
    } catch {
      setReviewMessage("Network error submitting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-sky-600 transition-colors">
          Products
        </Link>
        <span>/</span>
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-sky-600 transition-colors font-medium text-slate-700"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-slate-400 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Grid: Gallery on left, Info on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center p-4">
            <img
              src={images[selectedImageIndex]?.url || images[0]?.url}
              alt={product.name}
              className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow">
                {discountPercent}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 p-3 rounded-full shadow-md backdrop-blur-md transition-colors ${
                isFavorite
                  ? "bg-rose-50 text-rose-600"
                  : "bg-white/80 hover:bg-white text-slate-400 hover:text-rose-500"
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-rose-500" : ""}`} />
            </button>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl bg-white border-2 overflow-hidden shrink-0 transition-all p-1 ${
                    idx === selectedImageIndex
                      ? "border-sky-600 shadow-md scale-105"
                      : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover rounded-lg" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-sky-700 uppercase tracking-widest bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                {product.brand?.name || "Dental Cart Certified"}
              </span>
              <span className="text-xs text-slate-500 font-mono">HSN: {product.hsnCode || "9018"}</span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating and SKU */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-bold">
                <span>{product.rating.toFixed(1)}</span>
                <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
              </div>
              <span className="text-slate-500 font-medium">{product.reviewCount} Verified Clinic Reviews</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-mono">SKU: <strong>{product.sku}</strong></span>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900 font-mono">
                {formatINR(effectivePrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base text-slate-400 line-through font-mono">
                    {formatINR(product.price)}
                  </span>
                  <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    Save {formatINR(product.price - product.discountPrice)} ({discountPercent}% Off)
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-teal-800 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>+{product.gstPercentage}% GST Extra (100% ITC Claimable on GST Bill)</span>
            </p>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-600">
              <span>Unit: <strong>{product.unit}</strong></span>
              {product.batchNumber && <span>Batch No: <strong className="font-mono text-slate-800">{product.batchNumber}</strong></span>}
              {product.expiryDate && (
                <span>Expiry: <strong className="text-emerald-700 font-semibold">{new Date(product.expiryDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</strong></span>
              )}
            </div>
          </div>

          {/* Stock Status */}
          <div>
            {isOutOfStock ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Currently Out of Stock. Contact sales desk for expedited back-orders.</span>
              </div>
            ) : isLowStock ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Hurry! Only {product.stockQuantity} units remaining in warehouse.</span>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>In Stock ({product.stockQuantity} units available for same-day dispatch)</span>
              </div>
            )}
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-3 pt-2">
            {!isOutOfStock && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 font-bold text-xs font-mono">{quantity}</span>
                  <button
                    onClick={() => setQuantity((prev) => Math.min(product.stockQuantity, prev + 1))}
                    className="px-3 py-1.5 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-slate-400">Total: {formatINR(effectivePrice * quantity)}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="py-3.5 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="py-3.5 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Zap className="w-4 h-4" />
                Buy Now
              </button>
            </div>

            {addedToast && (
              <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold text-center animate-bounce shadow-lg">
                ✓ Added {quantity} unit(s) to Cart!
              </div>
            )}
          </div>

          {/* Delivery & Trust Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200 text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-sky-600" />
              <span>Free Delivery above ₹1,500</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>100% Genuine Brand Sourced</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>7 Days Return for Defective Items</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Official GST Bill Provided</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Technical Specifications Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8">
        <div>
          <h2 className="text-lg font-black text-slate-900 pb-3 border-b border-slate-200">
            Product Description & Clinical Indications
          </h2>
          <div className="pt-4 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
            <p>{product.description}</p>
          </div>
        </div>

        {/* Specifications Table */}
        {product.specifications && product.specifications.length > 0 && (
          <div>
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-200">
              Technical Specifications
            </h3>
            <div className="pt-4 overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <tbody>
                  {product.specifications.map((spec: any, idx: number) => (
                    <tr key={spec.id || idx} className={idx % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                      <td className="py-3 px-4 font-bold text-slate-700 w-1/3 border-b border-slate-100">
                        {spec.key}
                      </td>
                      <td className="py-3 px-4 text-slate-800 border-b border-slate-100">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Customer Ratings & Clinical Feedback ({product.reviews?.length || 0})
              </h3>
              <p className="text-xs text-slate-500">Verified doctor and clinic reviews</p>
            </div>
            <button
              onClick={() => setShowReviewModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              Write a Review
            </button>
          </div>

          <div className="pt-4 space-y-4">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev: any) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-xs text-slate-900">{rev.title}</span>
                    </div>
                    {rev.isVerifiedPurchase && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Verified Clinic Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                    <span className="font-semibold text-slate-700">{rev.user?.name}</span>
                    {rev.user?.customerProfile?.clinicName && (
                      <span>({rev.user.customerProfile.clinicName})</span>
                    )}
                    <span>•</span>
                    <span>{new Date(rev.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                No reviews yet for this product. Be the first dental clinician to review!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 relative animate-in fade-in">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-slate-900">Write a Clinical Product Review</h3>
            <p className="text-xs text-slate-500">
              Share your clinical experience and handling feedback for <strong>{product.name}</strong>
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Your Rating:</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{reviewRating} out of 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Review Headline</label>
                <input
                  type="text"
                  required
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Great shade match and smooth handling"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Your Review</label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Write your clinical experience regarding curing time, adhesion, ergonomics, or durability..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              {reviewMessage && (
                <div className="p-2.5 bg-sky-50 border border-sky-200 text-sky-800 rounded-xl text-xs font-medium">
                  {reviewMessage}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
