import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface DateTimeDisplayProps {
  className?: string;
}

const DateTimeDisplay: React.FC<DateTimeDisplayProps> = ({
  className = "",
}) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    // 1秒ごとに時刻を更新
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    // コンポーネントのクリーンアップ時にインターバルをクリア
    return () => clearInterval(intervalId);
  }, []);

  // 日付のフォーマット (例: 2025年2月28日 金曜日)
  const formattedDate = format(currentDateTime, "yyyy年MM月dd日 EEEE", {
    locale: ja,
  });

  // 時刻のフォーマット (例: 23:06:01)
  const formattedTime = format(currentDateTime, "HH:mm:ss");

  return (
    <div className={`text-center ${className}`}>
      <div className="text-3xl md:text-4xl font-light mb-2">
        {formattedDate}
      </div>
      <div className="text-6xl md:text-8xl font-roboto">{formattedTime}</div>
    </div>
  );
};

export default DateTimeDisplay;
