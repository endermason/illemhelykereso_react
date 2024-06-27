import React, { useEffect } from "react";
import { useTranslation, Trans } from "react-i18next";
import { useNavigate } from 'react-router-dom';

const NoPage = () => {
  //Localisation
  const { t } = useTranslation();
  const navigate = useNavigate();

  //Set the page title
  useEffect(() => { document.title = "404 | " + t("nav.main"); });

  const returnHome = () => {
    navigate("/");
  }

  //Render the page
  return (
    <>
      {/*404 image from public, in a div alligned center*/}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <img src="/404.png" alt="404" style={{ width: '33%', height: '33%' }} />
      </div>
      <h1 style={{fontSize:"28px"}}>{t("nav.404")+"😕"}</h1>
      <p style={{fontSize:"20px"}}><Trans i18nKey='nav.returnhome'> <b onClick={returnHome} style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }}><i></i></b></Trans></p>
    </>
  );
};

export default NoPage;
