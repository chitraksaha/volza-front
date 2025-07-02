"use client"

import { useState, useRef } from "react"
import { Upload, Download, Moon, Sun, BarChart3 } from "lucide-react"
import styles from "./volza-csv-analyzer.module.css"

const VolzaCSVAnalyzer = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const fileInputRef = useRef(null)

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode)

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (file && file.type === "text/csv") {
      setUploadedFile(file)
      await uploadToS3ViaPresignedURL(file)
    } else {
      alert("Please upload a valid CSV file")
    }
  }

  const handleDragOver = (e) => e.preventDefault()

  const handleDrop = async (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type === "text/csv") {
      setUploadedFile(file)
      await uploadToS3ViaPresignedURL(file)
    } else {
      alert("Please upload a valid CSV file")
    }
  }

  const uploadToS3ViaPresignedURL = async (file) => {
    try {
      setIsAnalyzing(true)

      const res = await fetch("https://6au9w43e09.execute-api.us-west-2.amazonaws.com/prod/get-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      })

      const outer = await res.json()
      const inner = JSON.parse(outer.body)
      const { presignedUrl } = inner

      await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      })

      // Extract base name without extension (case-insensitive)
      const baseName = file.name.replace(/\.csv$/i, "")
      const analyzedFileName = `${baseName}_analyzed.csv`

      // Set processed file name for later download
      setDownloadUrl(analyzedFileName)

      alert("✅ Upload successful. Processing started.")
    } catch (error) {
      console.error("❌ Upload failed:", error)
      alert("Upload failed")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleDownload = async () => {
    if (!downloadUrl || !downloadUrl.trim()) {
      alert("❌ No file selected. Please upload a file first.")
      return
    }

    const API_ENDPOINT = "https://6au9w43e09.execute-api.us-west-2.amazonaws.com/prod/get-download-url"
    const fileName = downloadUrl.trim()

    const payload = {
      action: "download",
      fileName,
    }

    try {
      console.log("📦 Download request for fileName:", fileName)

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Download failed."
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorMessage
        } catch {}
        throw new Error(errorMessage)
      }

      const result = await response.json()

      if (!result.downloadUrl) {
        throw new Error("Download URL missing in response.")
      }

      // Trigger download
      const link = document.createElement("a")
      link.href = result.downloadUrl
      link.download = result.fileName || fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("🔥 Download Failed:", error)
      alert(`🚨 Download failed: ${error.message}`)
    }
  }

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.dark : styles.light}`}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <BarChart3 size={32} color="#2563eb" />
            <span className={styles.logoText}>Volza Automation</span>
          </div>

          <nav className={styles.nav}>
            <a href="#" className={styles.navLink}>Home</a>
            <a href="#" className={styles.navLink}>Features</a>
            <a href="#" className={styles.navLink}>Pricing</a>
            <a href="#" className={styles.navLink}>Contact</a>
          </nav>

          <div className={styles.headerActions}>
            <button onClick={toggleDarkMode} className={styles.themeToggle} aria-label="Toggle dark mode">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className={styles.getStartedBtn}>Get Started</button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Upload CSV for Data Analysis</h1>
        </div>

        <div className={styles.content}>
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <div
                className={`${styles.uploadArea} ${isAnalyzing ? styles.disabled : ""}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleUploadClick}
              >
                <Upload size={48} className={styles.uploadIcon} />
                <h3 className={styles.uploadTitle}>
                  {isAnalyzing ? "Processing..." : "Drag and drop your CSV file here"}
                </h3>
                <p className={styles.uploadSubtitle}>Or click to browse</p>
                <button className={styles.uploadBtn} disabled={isAnalyzing}>
                  {isAnalyzing ? "Analyzing..." : "Upload CSV"}
                </button>
                {uploadedFile && <p className={styles.fileName}>Selected: {uploadedFile.name}</p>}
              </div>
              <input
                ref={fileInputRef}
                type="file"cd 
                accept=".csv"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </div>
          </div>

          <div className={styles.downloadSection}>
            <button
              onClick={handleDownload}
              disabled={!downloadUrl}
              className={`${styles.downloadBtn} ${!downloadUrl ? styles.disabled : ""}`}
            >
              <Download size={16} />
              Download Analysis Results
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default VolzaCSVAnalyzer
