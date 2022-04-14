import SummernoteGallery from "summernote-gallery/src/Module"

export default {
  loadSubBrick(subBrick) {
      switch (subBrick) {
          case 'summernote-gallery': return SummernoteGallery
      }
  }
}