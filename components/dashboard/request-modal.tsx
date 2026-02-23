"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from "lucide-react"

interface RequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When provided, request is tied to this client. */
  clientId?: string | null
}

export function RequestModal({ open, onOpenChange, clientId }: RequestModalProps) {
  const [category, setCategory] = useState("")
  const [priority, setPriority] = useState("normal")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/change-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId || null,
          category,
          priority,
          description,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || res.statusText)
      }
      onOpenChange(false)
      setCategory("")
      setPriority("normal")
      setDescription("")
      toast.success("Request submitted", { description: "We'll review your request and get back to you shortly." })
    } catch (err) {
      toast.error("Failed to submit", { description: err instanceof Error ? err.message : "Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Changes</DialogTitle>
          <DialogDescription>Submit a request to our team. We typically respond within 24 hours.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="category" className="text-sm">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="w-full"><SelectValue placeholder="Select a category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="ads">Ads</SelectItem>
                <SelectItem value="ai-receptionist">AI Receptionist</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="priority" className="text-sm">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="priority" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description" className="text-sm">Description</Label>
            <Textarea id="description" placeholder="Describe the changes you'd like..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm">Attachment</Label>
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-6 transition-colors hover:border-primary/30 hover:bg-muted/50">
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Upload className="size-5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Drop files here or click to browse</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting || !category || !description}>{submitting ? "Submitting..." : "Submit Request"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
