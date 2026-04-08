/* Copyright 2026 Marimo. All rights reserved. */

import { Slot as SlotPrimitive } from "radix-ui";

const Slot = SlotPrimitive.Slot;

import React, { type PropsWithChildren } from "react";
import { useImperativeModal } from "@/components/modal/ImperativeModal";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Constants } from "@/core/constants";

export const FeedbackButton: React.FC<PropsWithChildren> = ({ children }) => {
  const { openModal, closeModal } = useImperativeModal();

  return (
    <Slot onClick={() => openModal(<FeedbackModal onClose={closeModal} />)}>
      {children}
    </Slot>
  );
};

const FeedbackModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  return (
    <DialogContent className="w-fit">
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          const formData = new FormData(e.target as HTMLFormElement);
          const rating = formData.get("rating");
          const message = formData.get("message");

          // Fire-and-forget we don't care about the response
          void fetch("https://marimo.io/api/feedback", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              rating: rating,
              message,
            }),
          });
          onClose();
          toast({
            title: "反馈已发送！",
            description: "感谢你的反馈！",
          });
        }}
      >
        <DialogHeader>
          <DialogTitle>发送反馈</DialogTitle>
          <DialogDescription>
            <p className="my-2 prose dark:prose-invert">
              我们想听到你的意见，从轻微的 bug 报告到你希望加入的功能，甚至介于
              两者之间的任何反馈都可以。下面是几种联系方法：
            </p>
            <ul className="list-disc ml-8 my-2 prose dark:prose-invert">
              <li className="my-0">
                填写我们的{" "}
                <a
                  href={Constants.feedbackForm}
                  target="_blank"
                  className="underline"
                >
                  两分钟问卷。
                </a>
              </li>
              <li className="my-0">
                提交{" "}
                <a
                  href={Constants.issuesPage}
                  target="_blank"
                  className="underline"
                >
                  GitHub issue。
                </a>
              </li>
              <li className="my-0">
                在{" "}
                <a
                  href={Constants.discordLink}
                  target="_blank"
                  className="underline"
                >
                  Discord
                </a>
                上和我们交流。
              </li>
            </ul>
            <p className="my-2 prose dark:prose-invert">
              很高兴你参与到 Python 数据工具未来的建设中，感谢你成为社区的一部
              分！
            </p>
          </DialogDescription>
        </DialogHeader>
      </form>
    </DialogContent>
  );
};
