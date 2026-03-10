package net.deanasdogs.crypticCrossword.homePage.controllers

import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping

@Controller
class HomePageController {
    @GetMapping("/")
    fun home(model: Model): String {
        return "homePage";
    }
}