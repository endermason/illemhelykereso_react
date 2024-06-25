import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"
import Loading from "react-fullscreen-loading";
import NoPage from "./nopage";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "react-router-dom";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth } from "../config/firebase";
import { Form, Button, Container, InputGroup, FormControl, Alert } from 'react-bootstrap';


const MailChecker = () => {
    const [searchParams] = useSearchParams();
    const [mode, actionCode, apiKey, continueUrl, lang] = useMemo(() => {
        return [
            searchParams.get("mode"),
            searchParams.get("oobCode"),
            searchParams.get("apiKey"),
            searchParams.get("continueUrl"),
            searchParams.get("lang") || "",
        ];
    }, [searchParams]);

    if (mode === null || actionCode === null) {
        return <NoPage />;
    }
    if (mode !== "resetPassword") {                                               // Ha a mode nem resetPassword, akkor az alapértelemzett linkre irányít amit a Firebase csinál, jelenleg nem csinálna ilyet
        var url = "https://illemhely-b73d8.firebaseapp.com/__/auth/action?mode=";
        url += mode;
        url += "&oobCode=";
        url += actionCode;

        if (apiKey !== null) {
            url += "&apiKey=";
            url += apiKey;
        }

        if (continueUrl !== null) {
            url += "&continueUrl=";
            url += continueUrl;
        }

        if (lang !== null) {
            url += "&lang=";
            url += lang;
        }

        window.location.replace(url);
        return <Loading loading background="#ffffff" loaderColor="#3498db" />;
    }

    return <SetNewPassword actionCode={actionCode} />;
};

function SetNewPassword({ actionCode }) {
    //Check the parameters
    checkParameters(actionCode);

    //Localisation
    const { t } = useTranslation();

    //Set the page title
    useEffect(() => { document.title = t("reset.reset") + " | " + t("nav.main"); });

    //Error messages
    const [oobError, setOobError] = useState("");
    const [error, setError] = useState("");

    //Email address
    const [email, setEmail] = useState("");

    //Was the password reset done?
    const [done, setDone] = useState(false);

    //Password
    const [password, setPassword] = useState("");

    //Is the button enabled?
    const buttonEnabled = useMemo(() => password.length > 0, [password]);

    //Password visibility
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    //Verify the password reset code
    useEffect(() => {
        verifyPasswordResetCode(auth, actionCode)
            .then((email) => {
                setEmail(email);
            })
            .catch((error) => {
                setEmail(".")
                switch (error.code) {
                    case "auth/expired-action-code":
                    case "auth/invalid-action-code":
                        setOobError("error.password-reset-expired-or-invalid");
                        break;
                    default:
                        setOobError("error.error");
                        break;
                }
            });
    }, [actionCode]);

    //Change the password
    const onChangePassword = (e) => {
        e.preventDefault();

        const validatePassword = (password) => {
            // Check the length
            if (password.length < 8 || password.length > 20) {
                return 'error.characters' //"A jelszónak 8-20 karakter hosszúnak kell lennie.";
            }

            // Check for lowercase letter
            if (!/[a-z]/.test(password)) {
                return 'error.lowercase' //"A jelszónak tartalmaznia kell legalább egy kisbetűt.";
            }

            // Check for uppercase letter
            if (!/[A-Z]/.test(password)) {
                return 'error.uppercase' //"A jelszónak tartalmaznia kell legalább egy nagybetűt.";
            }

            // Check for number
            if (!/[0-9]/.test(password)) {
                return 'error.number' //"A jelszónak tartalmaznia kell legalább egy számot.";
            }

            // Check for special character
            if (!/[!?.,€@#$%^&*\-]/.test(password)) {
                return 'error.special' //"A jelszónak tartalmaznia kell legalább egy speciális karaktert.";
            }

            // If all conditions are met
            return null;
        };

        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        confirmPasswordReset(auth, actionCode, password)
            .then(() => {
                setDone(true);
            })
            .catch((error) => {
                switch (error.code) {
                    case "auth/expired-action-code":
                    case "auth/invalid-action-code":
                        setError("password-reset-expired-or-invalid");
                        break;
                    case "auth/weak-password":
                        setError("password-reset-weak-password");
                        break;
                    default:
                        setError("unknown-error");
                        break;
                }
            });
    }

    //Render the page
    if (!email) {
        return <Loading loading background="#ffffff" loaderColor="#3498db" />;
    }

    if (oobError) {
        return (
            <Container>
                <Alert variant="danger">{t(oobError)}</Alert>
                <br />
                <Link to="/login">{t("login.login")}</Link>
            </Container>
        );
    }

    if (done) {
        return (
            <Container>
                <Alert variant="success">{t("reset.success")}</Alert>
                <br />
                <Link to="/login">{t("login.login")}</Link>
            </Container>
        );
    }

    return (
        <Container>
            <div style={{ height: '2em' }}>
                {error && <Alert variant="danger">{t(error)}</Alert>}
            </div>
            <Form style={{ textAlign: "center", margin: "2em auto 1em" }}>
                <h1>{t("reset.newpassword")}</h1>
                <p><Trans i18nKey="reset.text" values={{ "email": email }}> <b> </b> </Trans></p>
                
                <Form.Label>{t("password")}</Form.Label>
                    <InputGroup className="mb-2" id="password">
                        <Form.Control
                            type={showPassword ? "text" : "password"}
                            onChange={(event) => { setPassword(event.target.value); }}
                        />
                        <Button onClick={handleClickShowPassword} variant="outline-secondary" className="password-toggle-button">
                            {showPassword ? t("hide") : t("show")}</Button>
                    </InputGroup>
                    <Button type="submit" disabled={!buttonEnabled} variant="primary" onClick={onChangePassword} className="mb-2">{t("save")}</Button>
                
            </Form>
        </Container>
    );
};

// Megvizsgálja a SetNewPassword komponensnek átadott paramétereket.

function checkParameters(actionCode) {
    if (actionCode === undefined) {
        throw new Error("actionCode is required.");
    }
    if (typeof actionCode !== "string") {
        throw new Error("actionCode must be a string.");
    }
}

export default MailChecker;
