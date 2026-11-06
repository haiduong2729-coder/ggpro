/* Xi · Google AI Pro Offer Injector — Bộ bảo vệ giá trong cửa sổ thanh toán (Price Guard)
 * Chức năng: Đọc điều khoản thực tế bên trong iframe thanh toán của Google Play:
 * Thanh xanh = Dùng thử miễn phí an toàn để bấm, Thanh đỏ = Có tính phí, tuyệt đối đừng bấm.
 */
(() => {
  if (window.__GAPT_GUARD || window.top === window) return; // Chỉ chạy trong iframe con
  window.__GAPT_GUARD = true;

  const FREE_WORDS = [
    "free trial", "start your free trial", "免费试用", "US$0.00", "$0.00", "0,00", "€0.00",
    "won't be charged", "不会向您收费", "不会收费",
    "dùng thử miễn phí", "bắt đầu dùng thử miễn phí", "thời gian dùng thử miễn phí",
    "sẽ không bị tính phí", "không bị tính phí", "0 đ", "0đ", "0 ₫", "0₫", "0,00 ₫", "0,00₫", "0.00 ₫", "0.00₫"
  ];
  const PAID_WORDS = [
    "/mo after", "/month after", "per month after", "立即付款", "pay now", "今日扣款", "charged today",
    "thanh toán ngay", "mỗi tháng sau", "/tháng sau", "bị tính phí hôm nay", "tính phí hôm nay"
  ];

  let bar = null;
  function paint(kind, text) {
    if (!document.body) return;
    if (!bar) {
      bar = document.createElement("div");
      bar.style.cssText = "position:fixed;left:0;right:0;top:0;z-index:2147483647;padding:10px 14px;" +
        "font:13px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;text-align:center;font-weight:600;";
      document.body.appendChild(bar);
    }
    bar.style.background = kind === "ok" ? "#1a7f37" : (kind === "bad" ? "#c62828" : "#616161");
    bar.style.color = "#fff";
    bar.textContent = text;
  }

  function judge() {
    let t = "";
    try {
      t = (document.body && document.body.innerText || "").toLowerCase();
    } catch (e) {
      return;
    }
    if (!t || t.length < 5) return;
    const free = FREE_WORDS.some((w) => t.includes(w.toLowerCase()));
    const paid = PAID_WORDS.some((w) => t.includes(w.toLowerCase()));

    if (free && !paid) {
      paint("ok", "✅ Đã phát hiện dùng thử miễn phí —— Cửa sổ này an toàn để đăng ký (vui lòng tự đối chiếu lại số tiền là $0.00)");
    } else if (paid && !free) {
      paint("bad", "❌ Không phát hiện dùng thử miễn phí, có thể bị trừ tiền thật —— Tạm thời ĐỪNG BẤM đăng ký, hãy quay lại đổi tầng thử lại");
    } else if (free && paid) {
      paint("warn", "⚠️ Điều khoản xuất hiện đồng thời cả miễn phí và tính phí —— Vui lòng tự kiểm tra kỹ số tiền trước khi bấm");
    } else {
      paint("warn", "… Chưa nhận diện được điều khoản giá (có thể trang đang tải)");
    }
  }

  setTimeout(judge, 1200);
  setTimeout(judge, 3000);
  setTimeout(judge, 6000);
  try {
    const mo = new MutationObserver(() => judge());
    document.addEventListener("DOMContentLoaded", () => mo.observe(document.body, { childList: true, subtree: true, characterData: true }));
  } catch (e) {}
})();
