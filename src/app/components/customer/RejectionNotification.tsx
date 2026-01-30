import { useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Textarea } from "@/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { ReturnRequest } from "@/app/data/mockData";
import { XCircle, AlertTriangle, MessageSquare, Star, FileText, Clock } from "lucide-react";
import { toast } from "sonner";

interface RejectionNotificationProps {
  returnRequest: ReturnRequest;
  onSubmitAppeal: (appealData: { appealReason: string; appealDetails: string }) => void;
  onSubmitFeedback: (feedbackData: { rating: number; comments: string }) => void;
}

export function RejectionNotification({ returnRequest, onSubmitAppeal, onSubmitFeedback }: RejectionNotificationProps) {
  const [showAppealDialog, setShowAppealDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [appealReason, setAppealReason] = useState("");
  const [appealDetails, setAppealDetails] = useState("");
  const [rating, setRating] = useState(0);
  const [feedbackComments, setFeedbackComments] = useState("");

  const { rejectionInfo } = returnRequest;

  if (!rejectionInfo) return null;

  const handleSubmitAppeal = () => {
    if (!appealReason || !appealDetails.trim()) {
      toast.error("Please provide appeal reason and details");
      return;
    }

    onSubmitAppeal({ appealReason, appealDetails });
    setShowAppealDialog(false);
    toast.success("Appeal submitted for manager review");
  };

  const handleSubmitFeedback = () => {
    if (rating === 0) {
      toast.error("Please provide a rating");
      return;
    }

    onSubmitFeedback({ rating, comments: feedbackComments });
    setShowFeedbackDialog(false);
    toast.success("Thank you for your feedback!");
  };

  const daysUntilDeadline = rejectionInfo.appealDeadline 
    ? Math.ceil((new Date(rejectionInfo.appealDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  // Show different views based on status
  const isWaitingForDecision = returnRequest.status === "appeal_requested" || returnRequest.status === "under_review";
  const isFinalRejection = returnRequest.status === "final_rejection";
  const canAppeal = rejectionInfo.canAppeal && !returnRequest.appealRequest && !returnRequest.customerFeedback && daysUntilDeadline > 0 && !isFinalRejection;

  return (
    <div className="space-y-4">
      {/* Rejection Notice */}
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 rounded-full">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isFinalRejection ? "Return Request - Final Decision" : "Return Request Rejected"}
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Rejection Reason:</p>
                <p className="text-base font-semibold text-red-700 mt-1">
                  {rejectionInfo.rejectionReason}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Details:</p>
                <p className="text-sm text-gray-900 mt-1">
                  {rejectionInfo.rejectionDetails}
                </p>
              </div>
              <div className="flex items-center gap-4 pt-2 border-t text-sm">
                <div>
                  <span className="text-gray-600">Rejected on:</span>
                  <span className="ml-2 font-medium">
                    {new Date(rejectionInfo.rejectedAt).toLocaleDateString()}
                  </span>
                </div>
                {rejectionInfo.appealDeadline && daysUntilDeadline > 0 && !isFinalRejection && (
                  <div>
                    <span className="text-gray-600">Appeal deadline:</span>
                    <span className="ml-2 font-medium">
                      {daysUntilDeadline} days remaining
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Product Info */}
      <Card className="p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Return Details</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Product:</span>
            <span className="ml-2 font-medium">{returnRequest.productName}</span>
          </div>
          <div>
            <span className="text-gray-600">Order:</span>
            <span className="ml-2 font-medium">{returnRequest.orderNumber}</span>
          </div>
          <div>
            <span className="text-gray-600">Purchase Date:</span>
            <span className="ml-2 font-medium">
              {new Date(returnRequest.purchaseDate).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Amount:</span>
            <span className="ml-2 font-medium">${returnRequest.purchasePrice.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      {/* Appeal Under Review Notice */}
      {isWaitingForDecision && returnRequest.appealRequest && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">Appeal Under Review</h4>
              <p className="text-sm text-gray-700 mb-3">
                Your appeal has been submitted and is being reviewed by our Operations Manager. You will receive a decision within 2-3 business days.
              </p>
              <div className="bg-white rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-900 mb-1">Your Appeal:</p>
                <p className="text-xs text-gray-600 mb-2">Reason: {returnRequest.appealRequest.appealReason}</p>
                <p className="text-gray-700">{returnRequest.appealRequest.appealDetails}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Submitted on {new Date(returnRequest.appealRequest.requestedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Final Rejection with Manager Notes */}
      {isFinalRejection && returnRequest.appealRequest?.reviewNotes && (
        <Card className="p-6 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">Manager Review Decision</h4>
              <p className="text-sm text-gray-700 mb-3">
                Your appeal has been reviewed and the decision is final.
              </p>
              <div className="bg-white rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-900 mb-1">Manager's Notes:</p>
                <p className="text-gray-700">{returnRequest.appealRequest.reviewNotes}</p>
                {returnRequest.appealRequest.reviewedAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Reviewed on {new Date(returnRequest.appealRequest.reviewedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Action Options - Only show if customer hasn't taken action yet */}
      {canAppeal && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">What would you like to do?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Request Review Option */}
            <button
              onClick={() => setShowAppealDialog(true)}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Request Review</h4>
                  <p className="text-sm text-gray-600">
                    Submit an appeal to have your case reviewed by our management team
                  </p>
                  {daysUntilDeadline > 0 && (
                    <Badge variant="outline" className="mt-2">
                      {daysUntilDeadline} days to appeal
                    </Badge>
                  )}
                </div>
              </div>
            </button>

            {/* Accept Decision Option */}
            <button
              onClick={() => setShowFeedbackDialog(true)}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all text-left group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                  <MessageSquare className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Accept Decision</h4>
                  <p className="text-sm text-gray-600">
                    Accept this decision and provide feedback about your experience
                  </p>
                </div>
              </div>
            </button>
          </div>
        </Card>
      )}

      {/* Feedback Already Submitted */}
      {returnRequest.customerFeedback && (
        <Card className="p-6 bg-gray-50">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-gray-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">Feedback Submitted</h4>
              <p className="text-sm text-gray-700 mb-2">Thank you for your feedback!</p>
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= (returnRequest.customerFeedback?.rating || 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              {returnRequest.customerFeedback.comments && (
                <p className="text-sm text-gray-700 italic">"{returnRequest.customerFeedback.comments}"</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Appeal Dialog */}
      <Dialog open={showAppealDialog} onOpenChange={setShowAppealDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Appeal Review</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-2">How Appeals Work</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Your case will be reviewed by an Operations Manager</li>
                <li>• You'll receive a decision within 2-3 business days</li>
                <li>• The manager's decision is final</li>
                <li>• Please provide clear reasoning for your appeal</li>
              </ul>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Appeal Reason *</label>
              <Select value={appealReason} onValueChange={setAppealReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason for appeal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Warranty Coverage">Warranty Coverage - Defect within warranty period</SelectItem>
                  <SelectItem value="Exceptional Circumstances">Exceptional Circumstances - Unforeseen situation</SelectItem>
                  <SelectItem value="Loyal Customer Exception">Loyal Customer Exception - Long-standing customer</SelectItem>
                  <SelectItem value="Technical Error">Technical Error - Believe system made an error</SelectItem>
                  <SelectItem value="Other">Other - Additional details provided below</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Additional Details *</label>
              <Textarea
                value={appealDetails}
                onChange={(e) => setAppealDetails(e.target.value)}
                placeholder="Please explain why you believe an exception should be made in your case. Include any relevant details that support your appeal..."
                rows={6}
              />
              <p className="text-xs text-gray-500">
                Provide specific details to help the manager understand your situation
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAppealDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmitAppeal}
                disabled={!appealReason || !appealDetails.trim()}
              >
                <FileText className="w-4 h-4 mr-2" />
                Submit Appeal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-700 mb-4">
                We appreciate your feedback. Please rate your experience with our return process.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Your Rating *</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 hover:text-yellow-200"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm text-gray-600">
                    {rating === 5 ? "Excellent" : rating === 4 ? "Good" : rating === 3 ? "Average" : rating === 2 ? "Poor" : "Very Poor"}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Comments (Optional)</label>
              <Textarea
                value={feedbackComments}
                onChange={(e) => setFeedbackComments(e.target.value)}
                placeholder="Tell us about your experience..."
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowFeedbackDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmitFeedback}
                disabled={rating === 0}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Submit Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
