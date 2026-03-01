import { useEffect } from "react";

declare global {
  interface Window {
    VK?: any;
  }
}

type VkNewsWidgetProps = {
  groupId?: number;
  height?: number;
  width?: number | "auto";
  className?: string;
};

export default function VkNewsWidget({
  groupId = 128344113,
  height = 600,
  width = "auto",
  className = "",
}: VkNewsWidgetProps) {
  const containerId = "vk_news_widget";

  useEffect(() => {
    const initWidget = () => {
      const container = document.getElementById(containerId);
      if (!container) return;

      // Prevent double-render if React remounts this component
      container.innerHTML = "";

      if (!window.VK?.Widgets?.Group) {
        console.log("VK Widgets not yet available, waiting...");
        setTimeout(initWidget, 500);
        return;
      }

      // mode: 4 - community wall (posts from group)
      window.VK.Widgets.Group(
        containerId,
        {
          mode: 4, // 4 = wall posts
          wide: 1,
          width,
          height,
        },
        groupId
      );
    };

    const ensureScript = () => {
      const existing = document.getElementById("vk-openapi-news");
      if (existing) {
        // Script already on page; try init now (or soon)
        if (window.VK) {
          setTimeout(initWidget, 100);
        } else {
          setTimeout(initWidget, 500);
        }
        return;
      }

      const script = document.createElement("script");
      script.id = "vk-openapi-news";
      script.async = true;
      script.src = "https://vk.com/js/api/openapi.js?169";
      script.onload = () => {
        console.log("VK OpenAPI loaded");
        setTimeout(initWidget, 100);
      };
      script.onerror = () => {
        console.error("Failed to load VK OpenAPI");
      };
      document.body.appendChild(script);
    };

    ensureScript();
  }, [groupId, height, width]);

  return <div id={containerId} className={className} />;
}
