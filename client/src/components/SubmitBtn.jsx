import React from "react";
import { useNavigation } from "react-router-dom";

const SubmitBtn = ({ formBtn }) => {
  const navigate = useNavigation();
  const isSubmitting = navigate.state === "submitting";

  return (
    <div>
      <button
        type="submit"
        className={`btn btn-block ${formBtn && "form-btn"}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? "submitting... " : "submit"}
      </button>
    </div>
  );
};

export default SubmitBtn;
