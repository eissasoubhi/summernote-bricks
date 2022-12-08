import SummernoteGallery from "summernote-gallery/dist/module"
import SummernoteHeading from "summernote-heading/dist/module"

export default {
  loadSubBrick(subBrick) {
      switch (subBrick) {
          case 'summernote-gallery': return SummernoteGallery
          case 'summernote-heading': return SummernoteHeading
      }
  }
}