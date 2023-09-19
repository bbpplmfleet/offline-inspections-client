"use client";
import { toastHelper } from "./utils";
import { Button, Tag, Text } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { serverUrl } from "../App";
import { handleSkipWaiting } from "../serviceWorkerConnector";

export default function AppHeader({ activeTab }: { activeTab: string }) {
  type OnlineStatusType = "online" | "offline" | "checking";
  const [onlineStatus, setOnlineStatus] =
    useState<OnlineStatusType>("checking");
  const [notificationStatus, setNotificationStatus] = useState("");
  async function checkNotificationStatus() {
    setNotificationStatus(Notification.permission);
  }
  async function grantNotifications() {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications.");
    } else {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          toastHelper({ message: "Notifications enabled", type: "info" });
        } else {
          toastHelper({
            message:
              "Notifications rejected, we won't be able to notify you about offline support",
            type: "warn",
          });
        }
        setNotificationStatus(permission);
      });
    }
  }
  async function checkOnlineStatus() {
    try {
      let result = await axios.get(`${serverUrl}/`);
      if (result.data) {
        setOnlineStatus("online");
      }
    } catch (e) {
      setOnlineStatus("offline");
      console.log("error checking status", e);
    }
  }
  async function checkServiceWorkerVersion() {
    try {
      let hasNew = await handleSkipWaiting();
      if (hasNew) {
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    (async () => {
      await checkServiceWorkerVersion();
      await checkOnlineStatus();
      await checkNotificationStatus();
    })();
  }, []);
  return (
    <div className="pb-8 w-full px-6 md:px-10 pt-6 bg-gray-900">
      <div className="flex flex-row justify-between gap-2 items-center flex-wrap w-full ">
        <div className="flex flex-row gap-1 items-center justify-start">
          <div className="h-8 w-8 -ml-4 -mt-2">
            <img
              className="overflow-hidden h-8"
              src={"/icon-512x512.png"}
              style={{ objectFit: "contain", height: "45px", width: "45px" }}
              alt={"plm-logo"}
            />
          </div>
          <Text
            fontSize={"3xl"}
            color={"gray.100"}
            as={"b"}
            className="text-left  flex-1"
          >
            PWA POC
          </Text>
        </div>
        <Text fontSize={"xl"} color={"gray.400"}>
          Progressive Web App Proof of Concept
        </Text>
      </div>
      <div className="flex flex-row justify-between items-center flex-wrap w-full my-2">
        <div className="flex flex-row justify-start">
          <Tag
            onClick={() => checkOnlineStatus()}
            size={"lg"}
            variant={"solid"}
            className={"cursor-pointer"}
            colorScheme={
              onlineStatus === "online"
                ? "green"
                : onlineStatus === "offline"
                ? "red"
                : "gray"
            }
          >
            Status: {onlineStatus}
          </Tag>
          <div>
            <Button
              variant="outline"
              colorScheme="whiteAlpha"
              disabled={notificationStatus === "granted"}
              onClick={() => grantNotifications()}
            >
              {notificationStatus !== "granted"
                ? "Allow Notifications"
                : "Notifications enabled"}
            </Button>
          </div>
        </div>
        <div className="flex flex-row justify-end items-center gap-2">
          <a
            href={"/"}
            className={`${
              activeTab === "/" ? "bg-blue-950" : ""
            } hover:bg-blue-900 border border-transparent px-6 py-2 rounded-md hover:border-b-blue-600 text-white`}
          >
            Upload New Photo
          </a>
          <a
            href={"/photos"}
            className={`${
              activeTab === "/photos" ? "bg-blue-950" : ""
            } hover:bg-blue-900 border border-transparent px-6 py-2 rounded-md hover:border-b-blue-600 text-white`}
          >
            See All Photos
          </a>
        </div>
      </div>
    </div>
  );
}
