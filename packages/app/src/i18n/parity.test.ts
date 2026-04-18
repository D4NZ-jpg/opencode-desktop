import { describe, expect, test } from "bun:test"
import { dict as en } from "./en"
import { dict as ar } from "./ar"
import { dict as br } from "./br"
import { dict as bs } from "./bs"
import { dict as da } from "./da"
import { dict as de } from "./de"
import { dict as es } from "./es"
import { dict as fr } from "./fr"
import { dict as ja } from "./ja"
import { dict as ko } from "./ko"
import { dict as no } from "./no"
import { dict as pl } from "./pl"
import { dict as ru } from "./ru"
import { dict as th } from "./th"
import { dict as zh } from "./zh"
import { dict as zht } from "./zht"
import { dict as tr } from "./tr"

const locales = [ar, br, bs, da, de, es, fr, ja, ko, no, pl, ru, th, tr, zh, zht]
const translatedKeys = [
  "command.session.previous.unseen",
  "command.session.next.unseen",
  "sidebar.sort.label",
  "sidebar.sort.projects",
  "sidebar.sort.threads",
  "sidebar.sort.updatedAt",
  "sidebar.sort.createdAt",
  "sidebar.status.processing",
  "sidebar.status.waiting",
] as const
const definedKeys = [...translatedKeys, "sidebar.sort.manual"] as const

describe("i18n parity", () => {
  test("non-English locales define targeted sidebar and unseen session keys", () => {
    for (const locale of locales) {
      for (const key of definedKeys) {
        expect(locale[key]).toBeDefined()
      }
    }
  })

  test("non-English locales translate targeted sidebar and unseen session keys", () => {
    for (const locale of locales) {
      for (const key of translatedKeys) {
        expect(locale[key]).not.toBe(en[key])
      }
    }
  })
})
