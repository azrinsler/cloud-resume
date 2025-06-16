import java.math.BigInteger
import java.security.MessageDigest
import java.util.Base64

object StringUtil {
    fun String.toBase64 () : String = Base64.getEncoder().encodeToString(this.toByteArray())
    fun String.toMd5 () : String = BigInteger( 1, MessageDigest.getInstance("MD5").digest( toByteArray() ) )
                                    .toString(16)
                                    .padStart(32, '0')
}