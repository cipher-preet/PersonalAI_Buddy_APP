package com.aiassistantapp.callsync

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

class CallSyncStore(private val context: Context) : SQLiteOpenHelper(context, "call_sync.db", null, 2) {
  override fun onCreate(db: SQLiteDatabase) = createSchema(db)

  override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
    if (oldVersion < 2) {
      val owner = activeUserId() ?: LEGACY_USER
      db.execSQL("ALTER TABLE whitelist RENAME TO whitelist_v1")
      db.execSQL("ALTER TABLE processed_recordings RENAME TO processed_recordings_v1")
      db.execSQL("DROP INDEX IF EXISTS processed_status_idx")
      createSchema(db)
      db.execSQL("INSERT OR IGNORE INTO whitelist(user_id, phone_number, number_key, created_at) SELECT ?, phone_number, CASE WHEN length(replace(phone_number, '+', '')) >= 10 THEN substr(replace(phone_number, '+', ''), -10) ELSE replace(phone_number, '+', '') END, created_at FROM whitelist_v1", arrayOf(owner))
      db.execSQL("INSERT OR IGNORE INTO processed_recordings(user_id, file_hash, phone_number, file_name, file_size, timestamp, upload_status, remote_url, updated_at) SELECT ?, file_hash, phone_number, file_name, file_size, timestamp, upload_status, remote_url, updated_at FROM processed_recordings_v1", arrayOf(owner))
      db.execSQL("DROP TABLE whitelist_v1")
      db.execSQL("DROP TABLE processed_recordings_v1")
    }
  }

  private fun createSchema(db: SQLiteDatabase) {
    db.execSQL("CREATE TABLE IF NOT EXISTS whitelist (user_id TEXT NOT NULL, phone_number TEXT NOT NULL, number_key TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY(user_id, number_key))")
    db.execSQL("""CREATE TABLE IF NOT EXISTS processed_recordings (
      user_id TEXT NOT NULL, file_hash TEXT NOT NULL, phone_number TEXT NOT NULL,
      file_name TEXT NOT NULL, file_size INTEGER NOT NULL, timestamp INTEGER NOT NULL,
      upload_status TEXT NOT NULL CHECK(upload_status IN ('PENDING','SUCCESS','FAILED')),
      remote_url TEXT, updated_at INTEGER NOT NULL, PRIMARY KEY(user_id, file_hash))""")
    db.execSQL("CREATE INDEX IF NOT EXISTS processed_status_idx ON processed_recordings(user_id, upload_status)")
  }

  fun setActiveUser(userId: String?) {
    val value = userId?.trim()?.takeIf(String::isNotEmpty)
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().apply {
      if (value == null) remove(ACTIVE_USER) else putString(ACTIVE_USER, value)
    }.apply()
  }

  fun activeUserId(): String? = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    .getString(ACTIVE_USER, null)?.takeIf(String::isNotBlank)

  fun getWhitelist(): List<String> {
    val user = activeUserId() ?: return emptyList()
    val values = mutableListOf<String>()
    readableDatabase.query("whitelist", arrayOf("phone_number"), "user_id = ?", arrayOf(user), null, null, "created_at DESC").use {
      while (it.moveToNext()) values += it.getString(0)
    }
    return values
  }

  fun addNumber(raw: String): Boolean {
    val user = activeUserId() ?: return false
    val number = normalize(raw) ?: return false
    val values = ContentValues().apply {
      put("user_id", user); put("phone_number", number); put("number_key", matchKey(number)); put("created_at", System.currentTimeMillis())
    }
    return writableDatabase.insertWithOnConflict("whitelist", null, values, SQLiteDatabase.CONFLICT_IGNORE) != -1L
  }

  fun removeNumber(raw: String): Boolean {
    val user = activeUserId() ?: return false
    val number = normalize(raw) ?: return false
    return writableDatabase.delete("whitelist", "user_id = ? AND number_key = ?", arrayOf(user, matchKey(number))) > 0
  }

  fun isWhitelisted(raw: String): Boolean {
    val user = activeUserId() ?: return false
    val number = normalize(raw) ?: return false
    return readableDatabase.query("whitelist", arrayOf("number_key"), "user_id = ? AND number_key = ?", arrayOf(user, matchKey(number)), null, null, null, "1").use { it.moveToFirst() }
  }

  fun wasUploaded(hash: String): Boolean {
    val user = activeUserId() ?: return false
    return readableDatabase.query("processed_recordings", arrayOf("file_hash"), "user_id = ? AND file_hash = ? AND upload_status = 'SUCCESS'", arrayOf(user, hash), null, null, null, "1").use { it.moveToFirst() }
  }

  fun record(hash: String, phone: String, name: String, size: Long, timestamp: Long, status: String, remoteUrl: String? = null) {
    val user = activeUserId() ?: return
    val values = ContentValues().apply {
      put("user_id", user); put("file_hash", hash); put("phone_number", phone); put("file_name", name)
      put("file_size", size); put("timestamp", timestamp); put("upload_status", status)
      put("remote_url", remoteUrl); put("updated_at", System.currentTimeMillis())
    }
    writableDatabase.insertWithOnConflict("processed_recordings", null, values, SQLiteDatabase.CONFLICT_REPLACE)
  }

  companion object {
    private const val PREFS = "call_sync_state"
    private const val ACTIVE_USER = "active_user_id"
    private const val LEGACY_USER = "legacy"

    fun normalize(raw: String?): String? {
      if (raw.isNullOrBlank()) return null
      val digits = raw.filter(Char::isDigit)
      return digits.takeIf { it.length in 7..15 }
    }

    fun matchKey(raw: String): String {
      val digits = raw.filter(Char::isDigit)
      return if (digits.length >= 10) digits.takeLast(10) else digits
    }

    fun numbersMatch(first: String, second: String) = matchKey(first) == matchKey(second)
  }
}
