"use client";

import React, { useState, useEffect } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import { Star, CheckCircle2, XCircle, Trash2 } from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  const loadReviews = async () => {
    try {
      const res = await fetch("/api/admin/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const toggleApproval = async (id: string, isApproved: boolean) => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: id, isApproved: !isApproved }),
      });
      if (res.ok) {
        setFeedback("Review status updated.");
        loadReviews();
        setTimeout(() => setFeedback(""), 2500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-12">
      <AdminHeader title="Customer Reviews & Ratings Moderation" />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div>
          <h2 className="text-xl font-black text-slate-900">Clinical Reviews ({reviews.length})</h2>
          <p className="text-xs text-slate-500">Moderate product ratings and feedback submitted by dental practitioners</p>
        </div>

        {feedback && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
            {feedback}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Doctor / Reviewer</th>
                  <th className="py-3 px-3 text-center">Rating</th>
                  <th className="py-3 px-4">Review Content</th>
                  <th className="py-3 px-3 text-center">Verified</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 truncate max-w-xs">
                      {r.product?.name}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{r.user?.name}</p>
                      <p className="text-[10px] text-slate-400">{r.user?.email}</p>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-0.5 text-amber-500 font-bold">
                        <span>{r.rating}</span>
                        <Star className="w-3 h-3 fill-amber-400" />
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <p className="font-bold text-slate-800 text-xs">{r.title}</p>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{r.comment}</p>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          r.isVerifiedPurchase ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {r.isVerifiedPurchase ? "VERIFIED" : "PUBLIC"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          r.isApproved ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {r.isApproved ? "APPROVED" : "HIDDEN"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => toggleApproval(r.id, r.isApproved)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-colors ${
                          r.isApproved
                            ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        }`}
                      >
                        {r.isApproved ? "Hide Review" : "Approve"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
