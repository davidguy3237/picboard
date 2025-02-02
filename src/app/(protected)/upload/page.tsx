"use client";
import { BatchUpload } from "@/app/(protected)/upload/components/batch-upload-form";
import { UploadForm } from "@/app/(protected)/upload/components/upload-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ImagePlus } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { FileRejection, FileWithPath, useDropzone } from "react-dropzone";
import { toast } from "sonner";

export default function UploadPage() {
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPath[]>([]);
  const [renderBatchUpload, setRenderBatchUpload] = useState<boolean>(false);
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length > 0) {
        rejectedFiles.map((file: FileRejection) => {
          toast.error(file.errors[0].message);
        });
      }
      setFiles([...files, ...acceptedFiles]);
    },
    [files],
  );

  const validateFile = (file: File) => {
    if (
      file.type !== "image/png" &&
      file.type !== "image/jpeg" &&
      file.type !== "image/webp" &&
      file.type !== "image/avif"
    ) {
      return {
        code: "file-invalid-type",
        message: "JPG, JPEG, PNG, WEBP, or AVIF files only",
      };
    }
    if (file.size > 1024 * 1024 * 4) {
      return {
        code: "size-too-large",
        message: "Image must be 4MB or smaller",
      };
    }
    return null;
  };

  const { getRootProps, getInputProps, isDragReject, isDragAccept } =
    useDropzone({
      onDrop,
      accept: {
        "image/png": [".png"],
        "image/jpeg": [".jpg", ".jpeg"],
        "image/webp": [".webp"],
        "image/avif": [".avif"],
      },
      maxFiles: 200,
      validator: validateFile,
    });

  const removeFile = (file: FileWithPath) => {
    const updatedFiles = files.filter((f) => f !== file);
    if (updatedFiles.length === 0) {
      setRenderBatchUpload(false);
    }
    setFiles(updatedFiles);
  };

  const resetFiles = () => {
    setRenderBatchUpload(false);
    setFiles([]);
    setUploadedFiles([]);
  };

  return files.length > 0 ? (
    <>
      <div className="my-4 flex w-full max-w-screen-md flex-col items-center rounded-lg border shadow-lg">
        <div className="flex w-full divide-x">
          <Button
            variant="ghost"
            className={cn(
              "w-full rounded-none font-semibold",
              renderBatchUpload &&
                "border-b bg-muted/15 font-normal text-muted-foreground",
            )}
            onClick={() => setRenderBatchUpload(false)}
          >
            Individual
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full rounded-none font-semibold",
              !renderBatchUpload &&
                "border-b bg-muted/15 font-normal text-muted-foreground",
            )}
            onClick={() => setRenderBatchUpload(true)}
          >
            Batch
          </Button>
        </div>
        <div className="w-full">
          {renderBatchUpload ? (
            <BatchUpload
              files={files}
              removeFile={removeFile}
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
            />
          ) : (
            <div className="divide-y p-2">
              <div className="p-2">
                <h3 className="text-2xl font-semibold">Individual Uploads</h3>
                <p className="text-sm text-muted-foreground">
                  Separate tags and descriptions for each image
                </p>
              </div>
              {files.map((file: FileWithPath) => (
                <UploadForm
                  key={file.path}
                  file={file}
                  removeFile={removeFile}
                  setUploadedFiles={setUploadedFiles}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {files.length === uploadedFiles.length && (
        <Button size="lg" onClick={resetFiles} className="mb-4 flex-shrink-0">
          Upload More
        </Button>
      )}
    </>
  ) : (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <Card className="flex h-1/2 w-full max-w-screen-lg cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground text-muted-foreground hover:bg-muted">
        <CardContent
          className={cn(
            "h-full w-full",
            isDragAccept && "bg-muted",
            isDragReject && "bg-destructive",
          )}
        >
          <div {...getRootProps()} className="h-full w-full">
            <input {...getInputProps()} />
            <div className="flex h-full w-full flex-col items-center justify-center gap-y-4 text-xl">
              <ImagePlus size={80} />
              <p>
                <span className="cursor-pointer font-bold hover:underline">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p>
                up to 200 images (JPG, JPEG, PNG, WEBP, or AVIF only), 4MB per
                file
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <p className="m-2 font-medium">
        By uploading, you agree to adhere to the{" "}
        <Link
          href="/guidelines"
          target="_blank"
          className="underline hover:font-bold"
        >
          Content Guidelines
        </Link>
      </p>
    </div>
  );
}
