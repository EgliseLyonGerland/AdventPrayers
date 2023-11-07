/* eslint-disable tailwindcss/no-custom-classname */
import * as ReactEmail from "@react-email/components";
import { type ReactNode, type CSSProperties } from "react";

import { AppName, AppNameQuoted } from "~/config";
import { toAbsoluteUrl } from "~/utils";

const primaryColor = "rgb(217, 38, 169)";
const buttonPadding = "16px 24px";

const defaults: CSSProperties = {
  fontSize: 16,
};

export function Text({ style, ...props }: ReactEmail.TextProps) {
  return (
    <ReactEmail.Text
      {...props}
      className="paragraph"
      style={{
        fontSize: defaults.fontSize,
        lineHeight: defaults.lineHeight,
        margin: "24px 0",
        ...style,
      }}
    />
  );
}

export function Button({
  href,
  ...props
}: Parameters<typeof ReactEmail.Button>[0]) {
  return (
    <ReactEmail.Button
      {...props}
      className="button"
      href={href ? toAbsoluteUrl(href) : undefined}
      style={{
        display: "block",
        padding: buttonPadding,
      }}
    />
  );
}

export const Image = ReactEmail.Img;

interface Props {
  heading?: string;
  preview?: string;
  signature?: boolean;
  children: ReactNode;
}

export default function Email({
  preview,
  heading,
  signature = true,
  children,
}: Props) {
  return (
    <ReactEmail.Html>
      <ReactEmail.Head>
        <style type="text/css">{`
          .body {
            font-size: ${defaults.fontSize}px;
            background-color: #1d232a;
            color: white;
            line-height: 1.6;
            margin: 0;
            font-family: sans-serif;
          }

          .container {
            background: rgba(0, 0, 0, 0.1);
            padding: 48px;
            margin-left: auto;
            margin-right: auto;
            max-width: 600px;
          }

          .button {
            display: block;
            color: ${primaryColor} !important;
            border: solid 1px;
            border-radius: 9999px;
            text-transform: uppercase;
            padding: ${buttonPadding};
            width: 100%;
            box-sizing: border-box;
            cursor: pointer;
            text-align: center;
            margin: 16px 0;
            font-weight: bold
          }

          .sectionsBorders {
            width: 100%;
            display: flex;
            margin-top: 32px;
            margin-bottom: 56px;
          }

          .sectionBorder {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            width: 155px;
          }

          .sectionCenter {
            border-bottom: 1px solid ${primaryColor};
            width: 290px;
          }

          @media (max-width: 640px) {
            .container {
              padding: 24px;
            }
          }
        `}</style>
      </ReactEmail.Head>

      {preview ? <ReactEmail.Preview>{preview}</ReactEmail.Preview> : null}

      <ReactEmail.Body className="body">
        <ReactEmail.Container className="container">
          <ReactEmail.Section>
            <ReactEmail.Img
              alt={AppName}
              height="76"
              src={toAbsoluteUrl(`/assets/images/logo-ealp.png`)}
              style={{ marginLeft: "auto", marginRight: "auto" }}
            />
          </ReactEmail.Section>

          <ReactEmail.Section className="sectionsBorders">
            <ReactEmail.Row>
              <ReactEmail.Column className="sectionBorder" />
              <ReactEmail.Column className="sectionCenter" />
              <ReactEmail.Column className="sectionBorder" />
            </ReactEmail.Row>
          </ReactEmail.Section>

          {heading ? (
            <ReactEmail.Heading
              style={{
                fontSize: 18,
                fontWeight: 400,
              }}
            >
              {heading}
            </ReactEmail.Heading>
          ) : null}

          {children}

          {signature ? (
            <>
              <Text style={{ marginTop: 48 }}>Fraternellement,</Text>
              <Text>— Nicolas de {AppNameQuoted}</Text>
            </>
          ) : null}

          <ReactEmail.Section
            style={{
              marginTop: 64,
              paddingTop: 24,
              borderTop: "solid 1px rgba(255,255,255,0.1)",
            }}
          >
            <ReactEmail.Link href="https://egliselyongerland.org">
              <ReactEmail.Img
                alt={AppName}
                height="27"
                src={toAbsoluteUrl(`/assets/images/logo-elgre.png`)}
                style={{
                  marginLeft: "auto",
                  marginRight: "auto",
                  opacity: 0.5,
                }}
                width="200"
              />
            </ReactEmail.Link>
          </ReactEmail.Section>
        </ReactEmail.Container>
      </ReactEmail.Body>
    </ReactEmail.Html>
  );
}
