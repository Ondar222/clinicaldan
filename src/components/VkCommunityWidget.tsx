import { useEffect } from "react";

declare global {
  interface Window {
    VK?: any;
  }
}

type VkCommunityWidgetProps = {
  groupId?: number;
  height?: number;
  width?: number | "auto";
  className?: string;
};

export default function VkCommunityWidget({
  groupId = 128344113,
  height = 600,
  width = "auto",
  className,
}: VkCommunityWidgetProps) {
  const containerId = "vk_community_widget";

  useEffect(() => {
    const initWidget = () => {
      const container = document.getElementById(containerId);
      if (!container) return;

      // Prevent double-render if React remounts this component
      container.innerHTML = "";

      if (!window.VK?.Widgets?.Group) return;

      window.VK.Widgets.Group(
        containerId,
        {
          mode: 4, // community wall
          wide: 1,
          width,
          height,
        },
        groupId,
      );
    };

    const ensureScript = () => {
      const existing = document.getElementById("vk-openapi");
      if (existing) {
        // Script already on page; try init now (or soon)
        if (window.VK) initWidget();
        else setTimeout(initWidget, 0);
        return;
      }

      const script = document.createElement("script");
      script.id = "vk-openapi";
      script.async = true;
      script.src = "https://vk.com/js/api/openapi.js?169";
      script.onload = initWidget;
      document.body.appendChild(script);
    };

    ensureScript();
  }, [groupId, height, width]);

  return <div id={containerId} className={className} />;
}





