package net.deanasdogs.crypticCrossword

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class CrypticCrosswordApplication

fun main(args: Array<String>) {
	runApplication<CrypticCrosswordApplication>(*args)
}
