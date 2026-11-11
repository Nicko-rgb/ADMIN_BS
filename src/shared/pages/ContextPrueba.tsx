
import type { CSSProperties } from "react"
import { useState } from "react"
import { Copy, Check, Layers } from "lucide-react"

import {
    useCompanyContextStore,
    useSessionStore,
} from "../store/sessionStore"

const pageStyle: CSSProperties = {
    padding: 24,
    fontFamily: "system-ui, sans-serif",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
    gap: 20,
    alignItems: "start",
    background: "#f8fafc",
    minHeight: "100vh",
}

const cardStyle: CSSProperties = {
    padding: 20,
    height: '100%',
    borderRadius: 12,
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    minWidth: 0,
    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
}

const headerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
}

const titleStyle: CSSProperties = {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    color: "#334155",
}

const preStyle: CSSProperties = {
    margin: 0,
    padding: 14,
    borderRadius: 8,
    background: "#f1f5f9",
    color: "#334155",
    fontSize: 13,
    lineHeight: 1.7,
    overflow: "auto",
    maxHeight: 320,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
}

const footerStyle: CSSProperties = {
    marginTop: 'auto',
    paddingTop: 12,
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
}

const codeStyle: CSSProperties = {
    fontSize: 11,
    color: "#64748b",
    overflowWrap: "anywhere",
    lineHeight: 1.5,
}

const copyButtonStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#475569",
    fontSize: 12,
    cursor: "pointer",
    flexShrink: 0,
}

const Block = ({
    title,
    value,
    code,
}: {
    title: string
    value: unknown
    code: string
}) => {
    const [copied, setCopied] = useState(false)

    const json = JSON.stringify(value, null, 4)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code)
            setCopied(true)

            setTimeout(() => {
                setCopied(false)
            }, 1500)
        } catch (error) {
            console.error("Error al copiar código:", error)
        }
    }

    return (
        <section style={cardStyle}>
            <div style={headerStyle}>
                <Layers size={18} color="#64748b" />
                <h2 style={titleStyle}>{title}</h2>
            </div>

            <pre style={preStyle}><code>{json}</code></pre>

            <div style={footerStyle}>
                <code style={codeStyle}>{code}</code>
                <button type="button" onClick={handleCopy} style={copyButtonStyle} title="Copiar código Zustand" >
                    {copied ? (
                        <><Check size={14} />Copiado</>
                    ) : (
                        <><Copy size={14} />Copiar</>
                    )}
                </button>
            </div>
        </section>
    )
}

const ContextPrueba = () => {
    const token = useSessionStore((state) => state.token)
    const user = useSessionStore((state) => state.user)
    const permissions = useSessionStore((state) => state.permissions)
    const scopeLevel = useSessionStore((state) => state.scopeLevel)

    const companies = useCompanyContextStore((state) => state.companies)

    return (
        <div style={pageStyle}>
            <Block
                title="session.token"
                value={token}
                code="const token = useSessionStore((state) => state.token)"
            />

            <Block
                title="session.user"
                value={user}
                code="const user = useSessionStore((state) => state.user)"
            />

            <Block
                title="session.permissions"
                value={permissions}
                code="const permissions = useSessionStore((state) => state.permissions)"
            />

            <Block
                title="session.scopeLevel"
                value={scopeLevel}
                code="const scopeLevel = useSessionStore((state) => state.scopeLevel)"
            />

            <Block
                title="context.companies"
                value={companies}
                code="const companies = useCompanyContextStore((state) => state.companies)"
            />
        </div>
    )
}

export default ContextPrueba
